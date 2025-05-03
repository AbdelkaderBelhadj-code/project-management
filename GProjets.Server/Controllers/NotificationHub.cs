using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace GProjets.Server.Controllers
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var user = Context.User;
            var allClaims = user?.Claims?.ToList();
            var role = user?.Claims?.FirstOrDefault(c =>
                c.Type == ClaimTypes.Role ||
                c.Type == "role" ||
                c.Type == "Role"
            )?.Value;

            Console.WriteLine($"[SignalR] All claims: {string.Join(", ", allClaims?.Select(c => $"{c.Type}={c.Value}") ?? new List<string>())}");

            if (role != null && role.ToLower() == "admin")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                Console.WriteLine($"[SignalR] Added connection {Context.ConnectionId} to Admins group.");
            }
            else
            {
                Console.WriteLine($"[SignalR] Not an admin, role detected: {role}");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var user = Context.User;
            if (user != null && user.Identity != null && user.Identity.IsAuthenticated)
            {
                var role = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
                if (role != null && role.ToLower() == "admin")
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Admins");
                }
            }
            await base.OnDisconnectedAsync(exception);
        }
    }

}
