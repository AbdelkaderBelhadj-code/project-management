using GProjets.Server.Data;
using GProjets.Server.Models.Entites;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GProjets.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectController : ControllerBase
    {
        private readonly GprojetsDbContext _context;

        public ProjectController(GprojetsDbContext context)
        {
            _context = context;
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllProjects()
        {
            var projects = await _context.Projects
                .Include(p => p.Chef)
                .Include(p => p.UserProjects)
                .ThenInclude(up => up.User)
                .Include(p => p.Taches)
                .ToListAsync();

            return Ok(projects);
        }


        [HttpPost("AddProject")]
        public async Task<IActionResult> AddProject([FromBody] Project project)
        {
            var chef = await _context.Users.FirstOrDefaultAsync(u => u.UserId == project.ChefId && u.Role.ToLower() == "chef");
            if (chef == null)
                return BadRequest(new { message = "Chef de projet non valide." });

            // Validation dates
            if (project.DateDebut > project.DateFin)
                return BadRequest(new { message = "La date de début doit être avant la date de fin." });

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Projet ajouté avec succès.", project });
        }

        // ✅ Update a project
        [HttpPut("UpdateProject/{projectId}")]
        public async Task<IActionResult> UpdateProject(int projectId, [FromBody] Project updatedProject)
        {
            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
                return NotFound(new { message = "Projet non trouvé." });

            if (updatedProject.ChefId != project.ChefId)
            {
                var chef = await _context.Users.FirstOrDefaultAsync(u => u.UserId == updatedProject.ChefId && u.Role.ToLower() == "chef");
                if (chef == null)
                    return BadRequest(new { message = "Chef de projet non valide." });

                project.ChefId = updatedProject.ChefId;
            }

            // Validation dates
            if (updatedProject.DateDebut > updatedProject.DateFin)
                return BadRequest(new { message = "La date de début doit être avant la date de fin." });

            project.Title = updatedProject.Title;
            project.Description = updatedProject.Description;
            project.DateDebut = updatedProject.DateDebut;
            project.DateFin = updatedProject.DateFin;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Projet mis à jour avec succès.", project });
        }

        // ✅ Delete a project
        [HttpDelete("{projectId}")]
        public async Task<IActionResult> DeleteProject(int projectId)
        {
            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
                return NotFound(new { message = "Projet non trouvé." });

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Projet supprimé avec succès." });
        }

        // ✅ Add member to a project
        [HttpPost("{projectId}/AddMember/{userId}")]
        public async Task<IActionResult> AddMember(int projectId, int userId)
        {
            if (await _context.UserProjects.AnyAsync(up => up.ProjectId == projectId && up.UserId == userId))
                return Conflict(new { message = "Ce membre est déjà assigné à ce projet." });

            _context.UserProjects.Add(new UserProject
            {
                ProjectId = projectId,
                UserId = userId
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Membre ajouté au projet." });
        }

        // ✅ Remove member from a project
        [HttpDelete("{projectId}/RemoveMember/{userId}")]
        public async Task<IActionResult> RemoveMember(int projectId, int userId)
        {
            var relation = await _context.UserProjects.FirstOrDefaultAsync(up => up.ProjectId == projectId && up.UserId == userId);
            if (relation == null)
                return NotFound(new { message = "Relation non trouvée." });

            _context.UserProjects.Remove(relation);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Membre retiré du projet." });
        }

        [HttpPost("{projectId}/AddTask")]
        public async Task<IActionResult> AddTask(int projectId, [FromBody] Tache tache)
        {
            var userInProject = await _context.UserProjects.AnyAsync(up => up.ProjectId == projectId && up.UserId == tache.AssignedToId);
            if (!userInProject)
                return BadRequest(new { message = "L'utilisateur n'est pas membre de ce projet." });

            if (tache.DateDebut == default || tache.DateFin == default)
                return BadRequest(new { message = "La date de début et la date de fin sont requises." });

            if (tache.DateDebut > tache.DateFin)
                return BadRequest(new { message = "La date de début doit être avant la date de fin." });

            tache.ProjectId = projectId;
            _context.Taches.Add(tache);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tâche ajoutée avec succès.", tache });
        }

        [HttpPut("UpdateTask/{taskId}")]
        public async Task<IActionResult> UpdateTask(int taskId, [FromBody] Tache updatedTache)
        {
            var tache = await _context.Taches.FindAsync(taskId);
            if (tache == null)
                return NotFound(new { message = "Tâche non trouvée." });

            // Optional date validation
            if (updatedTache.DateDebut.HasValue && updatedTache.DateFin.HasValue)
            {
                if (updatedTache.DateDebut > updatedTache.DateFin)
                    return BadRequest(new { message = "La date de début doit être avant la date de fin." });

                tache.DateDebut = updatedTache.DateDebut.Value;
                tache.DateFin = updatedTache.DateFin.Value;
            }

            tache.Title = updatedTache.Title;
            tache.Description = updatedTache.Description;
            tache.Status = updatedTache.Status;

            if (updatedTache.AssignedToId != 0)
            {
                var isMember = await _context.UserProjects.AnyAsync(up =>
                    up.ProjectId == tache.ProjectId && up.UserId == updatedTache.AssignedToId);

                if (!isMember)
                    return BadRequest(new { message = "Le nouvel utilisateur n'est pas membre de ce projet." });

                tache.AssignedToId = updatedTache.AssignedToId;
            }

            await _context.SaveChangesAsync();
            return Ok(tache);
        }


        // ✅ Delete a task from a project
        [HttpDelete("DeleteTask/{taskId}")]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            var tache = await _context.Taches.FindAsync(taskId);
            if (tache == null)
                return NotFound(new { message = "Tâche non trouvée." });

            _context.Taches.Remove(tache);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Tâche supprimée avec succès." });
        }

        [HttpGet("UserTasks/{userId}")]
        public async Task<IActionResult> GetTasksByUser(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
                return NotFound(new { message = "Utilisateur non trouvé." });

            var tasks = await _context.Taches
                .Include(t => t.Project) // Optional: include project details
                .Where(t => t.AssignedToId == userId)
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("{userId}/Projects")]
        public async Task<IActionResult> GetUserProjects(int userId)
        {
            // Projets où il est chef
            var projectsAsChefQuery = _context.Projects
                .Where(p => p.ChefId == userId);

            // Projets où il est membre (on récupère les IDs)
            var projectIdsAsMember = await _context.UserProjects
                .Where(up => up.UserId == userId)
                .Select(up => up.ProjectId)
                .ToListAsync();

            // Projets où il est chef ou membre
            var allProjectsQuery = _context.Projects
                .Where(p => p.ChefId == userId || projectIdsAsMember.Contains(p.ProjectId))
                .Include(p => p.Chef)
                .Include(p => p.UserProjects).ThenInclude(up => up.User)
                .Include(p => p.Taches);

            var allProjects = await allProjectsQuery.ToListAsync();

            return Ok(allProjects);
        }

        [HttpGet("ProjectMembers/{projectId}")]
        public async Task<IActionResult> GetProjectMembers(int projectId)
        {
            var members = await (from up in _context.UserProjects
                                 join u in _context.Users on up.UserId equals u.UserId
                                 where up.ProjectId == projectId && u.Role.ToLower() == "membre"
                                 select new
                                 {
                                     u.UserId,
                                     u.FirstName,
                                     u.LastName,
                                     u.Email
                                 })
                                 .ToListAsync();

            return Ok(members);
        }

    }
}
