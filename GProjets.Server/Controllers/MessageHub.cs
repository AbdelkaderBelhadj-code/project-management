using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using GProjets.Server.Data;
using System.Security.Claims;
using GProjets.Server.Models.Entites;

namespace GProjets.Server.Controllers
{
    public class MessageHub : Hub
    {
        private readonly GprojetsDbContext _db;

        public MessageHub(GprojetsDbContext db)
        {
            _db = db;
        }

        public override async Task OnConnectedAsync()
        {
            var role = Context.User?.Claims?.FirstOrDefault(c =>
                c.Type == ClaimTypes.Role ||
                c.Type == "role" ||
                c.Type == "Role"
            )?.Value?.ToLower();

            var username = Context.User?.Identity?.Name ?? "unknown";
            Console.WriteLine($"[CONNECTED] User '{username}' connected with role '{role}' and connectionId {Context.ConnectionId}");

            // Optionally add to role-based groups (can be useful for role-specific features)
            if (!string.IsNullOrEmpty(role))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, role);
                Console.WriteLine($"[GROUP] '{username}' added to group '{role}'");
            }
            else
            {
                Console.WriteLine($"[WARNING] Unknown role '{role}' for user '{username}'");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var role = Context.User?.Claims?.FirstOrDefault(c =>
                c.Type == ClaimTypes.Role ||
                c.Type == "role" ||
                c.Type == "Role"
            )?.Value?.ToLower();

            var username = Context.User?.Identity?.Name ?? "unknown";
            Console.WriteLine($"[DISCONNECTED] User '{username}' with role '{role}' disconnected");

            if (!string.IsNullOrEmpty(role))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, role);
                Console.WriteLine($"[GROUP] '{username}' removed from group '{role}'");
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string content, string senderEmail, string senderRole)
        {
            var message = new Message
            {
                Content = content,
                SenderRole = senderRole,
                SenderEmail = senderEmail,
                SentAt = DateTime.UtcNow
            };

            _db.Messages.Add(message);
            await _db.SaveChangesAsync();

            Console.WriteLine($"[MESSAGE] {senderRole} '{senderEmail}' sent message: '{content}'");

            await Clients.All.SendAsync("ReceiveMessage", new
            {
                content = message.Content,
                senderRole = message.SenderRole,
                senderEmail = message.SenderEmail,
                sentAt = message.SentAt
            });
        }
    }
}