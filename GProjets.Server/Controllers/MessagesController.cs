using GProjets.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GProjets.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly GprojetsDbContext _db;

        public MessagesController(GprojetsDbContext db)
        {
            _db = db;
        }

        // GET: api/messages
        [HttpGet]
        public async Task<IActionResult> GetMessages()
        {
            var messages = await _db.Messages
                .OrderByDescending(m => m.SentAt)
                .Take(50) // Last 50 messages
                .OrderBy(m => m.SentAt)
                .ToListAsync();
            return Ok(messages);
        }
    }
}
