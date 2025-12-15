using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using TodoAPI.Data;
using TodoAPI.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

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

// Seed database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SeedData.Initialize(db);
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors(appOrigins);

app.MapPost("/tasks", async (AppDbContext db, TodoTask task) =>
{
    db.Tasks.Add(task);
    await db.SaveChangesAsync();
    return Results.Created($"/tasks/{task.Id}", task);
});

app.MapGet("/tasks", async (AppDbContext db) => await db.Tasks.AsNoTracking().ToListAsync());

app.MapGet("/tasks/{id}", async (AppDbContext db, int id) =>
{
    var task = await db.Tasks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
    return task is null ? Results.NotFound() : Results.Ok(task);
});

app.MapPut("/tasks/{id}", async (AppDbContext db, int id, TodoTask uptTask) =>
{
    var tarefa = await db.Tasks.FindAsync(id);
    if (tarefa is null) return Results.NotFound();

    tarefa.Title = uptTask.Title;
    tarefa.Content = uptTask.Content;
    tarefa.Concluded = uptTask.Concluded;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/tasks/{id}", async (AppDbContext db, int id) =>
{
    var tarefa = await db.Tasks.FindAsync(id);
    if (tarefa is null) return Results.NotFound();

    db.Tasks.Remove(tarefa);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapPatch("/tasks/{id}/conclude", async (AppDbContext db, int id) =>
{
    var tarefa = await db.Tasks.FindAsync(id);
    if (tarefa is null) return Results.NotFound();

    tarefa.Concluded = true;
    await db.SaveChangesAsync();

    return Results.Ok(tarefa);
});

app.Run();