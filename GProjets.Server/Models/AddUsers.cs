using System.ComponentModel.DataAnnotations;

namespace GProjets.Server.Models
{
    public class AddUsers
    {
        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }
       

        [Required]
        public string Role { get; set; }
        [Required]
        public string Password { get; set; }
    
}

}
