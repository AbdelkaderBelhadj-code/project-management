using GProjets.Server.Controllers;
using GProjets.Server.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace GProjets.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy
                        .WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            // Ajouter les contrôleurs
            builder.Services.AddControllers();

            // Swagger pour la documentation API
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Configuration SignalR
            builder.Services.AddSignalR();

            // Configuration JWT (JSON Web Token)
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"], // Configuré dans appsettings.json
                    ValidAudience = builder.Configuration["Jwt:Audience"], // Configuré dans appsettings.json
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])) // Configuré dans appsettings.json
                };
                // Permettre au client SignalR de passer le token via query string
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) &&
                            (path.StartsWithSegments("/notifications"))) // <-- URL du hub SignalR
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
            });

            // Connexion à la base SQL Server
            builder.Services.AddDbContext<GprojetsDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

            // Enregistre le service de notification en arrière-plan
            builder.Services.AddHostedService<DeadlineNotificationService>();

            var app = builder.Build();

            app.UseAuthentication();

            // Swagger activé seulement en mode développement
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Redirection HTTPS
            app.UseHttpsRedirection();

            // Activation CORS
            app.UseCors("AllowFrontend");

            // Middleware d'authentification et d'autorisation
            app.UseAuthentication();
            app.UseAuthorization();

            // Routing des contrôleurs
            app.MapControllers();

            // Mapping du hub SignalR
            app.MapHub<NotificationHub>("/notifications");

            // Lancement de l'application
            app.Run();
        }
    }
}