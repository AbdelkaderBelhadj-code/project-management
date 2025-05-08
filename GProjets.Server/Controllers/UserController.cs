using GProjets.Server.Data;
using GProjets.Server.Models;
using GProjets.Server.Models.Entites;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GProjets.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly GprojetsDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public UserController(GprojetsDbContext dbContext, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _configuration = configuration;
        }

        // ✅ Connexion de l'utilisateur
        [HttpPost("Login")]
        public IActionResult Login([FromBody] LoginDto loginDto)
        {
            var user = _dbContext.Users.FirstOrDefault(x => x.Email == loginDto.Email);
            if (user != null && BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {

                var claims = new[]
                {
                new Claim(JwtRegisteredClaimNames.Sub, _configuration["Jwt:Subject"]),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("UserId", user.UserId.ToString()),
                new Claim("Email", user.Email),
                new Claim("Role", user.Role)
            };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(60),
                    signingCredentials: creds
                );

                string tokenValue = new JwtSecurityTokenHandler().WriteToken(token);

                return Ok(new { token = tokenValue, user });
            }
            return Unauthorized(new { message = "Identifiants invalides" });
        }


        // ✅ Récupérer tous les utilisateurs
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _dbContext.Users
                .Select(u => new
                {
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.Role
                })
                .ToListAsync();

            return Ok(users);
        }

        // ✅ Ajouter un nouvel utilisateur
        [HttpPost("AddUser")]
        public async Task<IActionResult> AddUser([FromBody] AddUsers addUserDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == addUserDto.Email);
            if (existingUser != null)
                return Conflict(new { message = "Un utilisateur avec cet email existe déjà." });

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(addUserDto.Password);

            var user = new User
            {
                FirstName = addUserDto.FirstName,
                LastName = addUserDto.LastName,
                Email = addUserDto.Email,
                Password = passwordHash,
                Role = addUserDto.Role
            };

            try
            {
                _dbContext.Users.Add(user);
                await _dbContext.SaveChangesAsync();
                return Ok(new { message = "Utilisateur ajouté avec succès", user });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Erreur lors de l'ajout de l'utilisateur", details = ex.Message });
            }
        }

        // ✅ Mise à jour d'un utilisateur
        [HttpPut("{email}")]
        public async Task<IActionResult> UpdateUser(string email, [FromBody] UpdateUser updatedUser)
        {
            // Recherche de l'utilisateur par email
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return NotFound(new { message = "Utilisateur non trouvé avec cet email." });

            // Vérifier si l'email mis à jour est déjà pris par un autre utilisateur
            if (await _dbContext.Users.AnyAsync(u => u.Email == updatedUser.Email && u.Email != email))
            {
                return BadRequest(new { message = "L'email est déjà utilisé." });
            }

            // Mise à jour des informations de l'utilisateur
            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.Email = updatedUser.Email;
            user.Role = updatedUser.Role;

            // Sauvegarder les modifications
            await _dbContext.SaveChangesAsync();

            // Retour de succès
            return Ok(new { message = "Utilisateur mis à jour avec succès." });
        }






        [HttpDelete("{email}")]
        public async Task<IActionResult> DeleteUser(string email)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return NotFound(new { message = "Utilisateur non trouvé" });

            // 1. Unassign the user from tasks
            var tasks = await _dbContext.Taches
                .Where(t => t.AssignedToId == user.UserId)
                .ToListAsync();
            foreach (var task in tasks)
            {
                task.AssignedToId = null; // Unassign the user
            }

            // 2. Remove user from all project associations (UserProjects)
            var userProjects = await _dbContext.UserProjects
                .Where(up => up.UserId == user.UserId)
                .ToListAsync();
            _dbContext.UserProjects.RemoveRange(userProjects);

            // 3. Remove the user
            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Utilisateur supprimé avec succès" });
        }



        // ✅ Obtenir les emails des utilisateurs ayant le rôle "Chef"
        [HttpGet("Chefs")]
        public async Task<IActionResult> GetChefs()
        {
            var chefs = await _dbContext.Users
                .Where(u => u.Role.ToLower() == "chef")
                .Select(u => new { u.Email })
                .ToListAsync();

            if (!chefs.Any())
                return NotFound(new { message = "Aucun utilisateur avec le rôle 'Chef' trouvé." });

            return Ok(chefs);
        }

        // ✅ Obtenir les emails des utilisateurs ayant le rôle "Membre"
        [HttpGet("Membres")]
        public async Task<IActionResult> GetMembres()
        {
            var membres = await _dbContext.Users
                .Where(u => u.Role.ToLower() == "membre")
                .Select(u => new { u.Email })
                .ToListAsync();

            if (!membres.Any())
                return NotFound(new { message = "Aucun utilisateur avec le rôle 'Membre' trouvé." });

            return Ok(membres);
        }

        [HttpGet("AllChefs")]
        public async Task<IActionResult> GetAllChefs()
        {
            var chefs = await _dbContext.Users
                .Where(u => u.Role.ToLower() == "chef")
                .Select(u => new
                {
                    u.UserId,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.Role
                })
                .ToListAsync();

            if (!chefs.Any())
                return NotFound(new { message = "Aucun utilisateur avec le rôle 'Chef' trouvé." });

            return Ok(chefs);
        }

        [HttpGet("Members")]
        public async Task<IActionResult> GetAllMembers()
        {
            var members = await _dbContext.Users
                .Where(u => u.Role.ToLower() == "member")
                .Select(u => new
                {
                    u.UserId,
                    u.FirstName,
                    u.LastName,
                    u.Email
                })
                .ToListAsync();

            return Ok(members);
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetUserById(int userId)
        {
            var user = await _dbContext.Users
                .Where(u => u.UserId == userId)
                .Select(u => new
                {
                    u.UserId,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.Role
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "Utilisateur non trouvé." });

            return Ok(user);
        }
    }
}
