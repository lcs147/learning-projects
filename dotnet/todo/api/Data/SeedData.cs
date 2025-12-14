using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TodoAPI.Models;

namespace TodoAPI.Data;

public static class SeedData
{
    public static async Task Initialize(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();
        if (!await db.Tasks.AnyAsync())
        {
            db.Tasks.AddRange(
                new TodoTask { Title = "Test Task 1", Content = "This is Task 1 test content" },
                new TodoTask { Title = "Test Task 2", Content = "This is Task 2 test content" },
                new TodoTask { Title = "Test Task 3", Content = "This is Task 3 test content" }
            );
            await db.SaveChangesAsync();
        }
    }
}