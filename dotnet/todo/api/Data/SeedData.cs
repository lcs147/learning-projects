using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TodoAPI.Models;

namespace TodoAPI.Data;

public static class SeedData
{
    public static async Task Initialize(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();
    }
}