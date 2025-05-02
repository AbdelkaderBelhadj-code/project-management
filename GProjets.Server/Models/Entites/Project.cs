using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace GProjets.Server.Models.Entites
{
    public class Project
    {
        [Key]
        public int ProjectId { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public int ChefId { get; set; }

        [ForeignKey("ChefId")]
        public User? Chef { get; set; }

        public ICollection<UserProject>? UserProjects { get; set; }
        public ICollection<Tache>? Taches { get; set; }

    }
}