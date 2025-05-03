using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace GProjets.Server.Models.Entites
{
    public class Tache
    {
        [Key]
        public int TacheId { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public int AssignedToId { get; set; }

        [ForeignKey("AssignedToId")]
        public User? AssignedTo { get; set; }

        public int? ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }

        public string Status { get; set; } = "En attente";

        // 🟢 Add these:
        [DataType(DataType.Date)]
        public DateTime? DateDebut { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateFin { get; set; }

    }
}