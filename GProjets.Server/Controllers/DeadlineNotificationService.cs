using GProjets.Server.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace GProjets.Server.Controllers
{
    public class DeadlineNotificationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<NotificationHub> _hubContext;

        public DeadlineNotificationService(IServiceProvider serviceProvider, IHubContext<NotificationHub> hubContext)
        {
            _serviceProvider = serviceProvider;
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<GprojetsDbContext>();
                    var now = DateTime.UtcNow;
                    var tomorrow = now.AddDays(1);

                    var urgentTasks = await context.Taches
                        .Include(t => t.Project)
                        .Include(t => t.AssignedTo)
                        .Where(t =>
                            (t.Status == "En attente" || t.Status == "En cours") &&
                            t.DateFin.HasValue &&
                            (
                                t.DateFin.Value < now || // Dépassée
                                (t.DateFin.Value >= now && t.DateFin.Value <= tomorrow) // Moins de 1 jour
                            )
                        )
                        .ToListAsync();

                    foreach (var task in urgentTasks)
                    {
                        string notif = $"La tâche '{task.Title}' du projet '{task.Project?.Title}' est " +
                                       $"{(task.DateFin.Value < now ? "en retard" : "proche de l'échéance")} (date de fin : {task.DateFin:yyyy-MM-dd})";

                        // Envoie la notification uniquement au groupe "Admins"
                        await _hubContext.Clients.Group("Admins").SendAsync("ReceiveNotification", notif);
                        Console.WriteLine($"Sending notification for task '{task.Title}'");

                    }
                }

                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }
    }
}

