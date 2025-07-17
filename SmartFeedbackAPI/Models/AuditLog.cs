using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartFeedbackAPI.Models
{
    public class AuditLog
    {
        public int Id { get; set; }

        [Required]
        public string ActionType { get; set; } = string.Empty; // e.g., "StatusUpdate", "RoleChange", "Login"

        public string? Description { get; set; }

        [Required]
        public DateTime Timestamp { get; set; }

        // FK: who performed the action
        public int PerformedByUserId { get; set; }

        [ForeignKey("PerformedByUserId")]
        public User? PerformedByUser { get; set; }

        // FK: target user (optional)
        public int? TargetUserId { get; set; }

        [ForeignKey("TargetUserId")]
        public User? TargetUser { get; set; }

        // FK: feedback affected (optional)
        public int? FeedbackId { get; set; }

        [ForeignKey("FeedbackId")]
        public Feedback? Feedback { get; set; }
    }
}
