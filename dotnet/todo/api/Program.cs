using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using TodoAPI.Data;
using TodoAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;


var builder = WebApplication.CreateBuilder(args);   

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = "TodoAPI";
var jwtAudience = "TodoAPI";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var appOrigins = "Frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: appOrigins,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:5173") // REACT APP URL
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseAuthentication();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors(appOrigins);

app.MapPost("/register", async (AppDbContext db, TodoUserDto request) => {
    if(await db.Users.AnyAsync(u => u.Email == request.Email)) return Results.BadRequest("User already exists");

    var newUser = new TodoUser {
        Email = request.Email,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
        Name = request.Name
    };
    db.Users.Add(newUser);
    await db.SaveChangesAsync();

    return Results.Ok("User registered successfully.");
});

app.MapPost("/login", async (AppDbContext db, TodoUserDto request) => {
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
    if(user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)) return Results.Unauthorized();

    var claims = new[] {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Name),
        new Claim(ClaimTypes.Email, user.Email),
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(
        issuer: jwtIssuer,
        audience: jwtAudience,
        claims: claims,
        expires: DateTime.UtcNow.AddHours(1),
        signingCredentials: creds
    );

    var jwt = new JwtSecurityTokenHandler().WriteToken(token);
    return Results.Ok(new { token = jwt });
});

app.MapGet("/me", (ClaimsPrincipal user) => {
    var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
    var email = user.FindFirstValue(ClaimTypes.Email);
    var name = user.FindFirstValue(ClaimTypes.Name);
    return Results.Ok(new {id = id, email = email, name = name, message = "User Authorized"});
})
.RequireAuthorization();

app.MapPost("/tasks", async (AppDbContext db, TodoTask task, ClaimsPrincipal user) => {
    var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if(!int.TryParse(userIdStr, out int id)) return Results.Unauthorized();

    task.UserId = id;
    db.Tasks.Add(task);
    await db.SaveChangesAsync();
    return Results.Created($"/tasks/{task.Id}", task);

})
.RequireAuthorization();

app.MapGet("/tasks", async (AppDbContext db, ClaimsPrincipal user) => {
    var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if(!int.TryParse(userIdStr, out int userId)) return Results.Unauthorized();

    var tasks = await db.Tasks.Where(u => u.UserId == userId).ToListAsync();
    return Results.Ok(tasks);
})
.RequireAuthorization();

app.MapGet("/tasks/{id}", async (AppDbContext db, int id, ClaimsPrincipal user) => {
    var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if(!int.TryParse(userIdStr, out int userId)) return Results.Unauthorized();

    var task = await db.Tasks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
    

    if(task is null) return Results.NotFound();

    if(task.UserId != userId) return Results.Forbid();
    return Results.Ok(task);
})
.RequireAuthorization();

app.MapPut("/tasks/{id}", async (AppDbContext db, int id, TodoTaskDto uptTask, ClaimsPrincipal user, ILogger<Program> logger) => {

    logger.LogWarning("{id}", id);

    var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if(!int.TryParse(userIdStr, out int userId)) return Results.Unauthorized();
    logger.LogWarning("{id} {userId}", id, userId);

    var task = await db.Tasks.FindAsync(id);
    if(task is null) return Results.NotFound();
    if(task.UserId != userId) return Results.Forbid();

    task.Title = uptTask.Title;
    task.Content = uptTask.Content;
    task.Concluded = uptTask.Concluded;

    await db.SaveChangesAsync();
    return Results.NoContent();
})
.RequireAuthorization();

app.MapDelete("/tasks/{id}", async (AppDbContext db, int id, ClaimsPrincipal user) => {
    var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if(!int.TryParse(userIdStr, out int userId)) return Results.Unauthorized();

    var task = await db.Tasks.FindAsync(id);
    if(task is null) return Results.NotFound();
    if(task.UserId != userId) return Results.Forbid();

    db.Tasks.Remove(task);
    await db.SaveChangesAsync();
    return Results.NoContent();
})
.RequireAuthorization();

app.MapPatch("/tasks/{id}/conclude", async (AppDbContext db, int id, ClaimsPrincipal user) => {
    var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if(!int.TryParse(userIdStr, out int userId)) return Results.Unauthorized();

    var task = await db.Tasks.FindAsync(id);
    if(task is null) return Results.NotFound();
    if(task.UserId != userId) return Results.Forbid();

    task.Concluded = true;
    await db.SaveChangesAsync();

    return Results.Ok(task);
})
.RequireAuthorization();

app.Run();