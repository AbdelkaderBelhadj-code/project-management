using System.ComponentModel.DataAnnotations;

namespace GProjets.Server.Models.Entites
{
    public class Message
    {
        public int Id { get; set; }
        public string? Content { get; set; }
        public string? SenderRole { get; set; }
        public string? SenderEmail { get; set; } // <-- Add this
        public DateTime SentAt { get; set; }
    }
}
