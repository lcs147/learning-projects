using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
namespace TodoAPI.Models;

[Index(nameof(Email), IsUnique = true)]
public class TodoUser
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; } = string.Empty;
}
public record TodoUserDto(string Name, string Email, string Password);