namespace TodoAPI.Models;
public class TodoTask
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public bool Concluded { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}