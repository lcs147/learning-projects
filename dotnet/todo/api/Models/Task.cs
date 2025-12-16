using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Components.Web;

namespace TodoAPI.Models;
public class TodoTask
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public bool Concluded { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}

public record TodoTaskDto(string Title, string Content, bool Concluded);