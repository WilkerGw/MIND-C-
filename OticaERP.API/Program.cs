using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar Banco de Dados (PostgreSQL / SQLite)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Configurar CORS (Permitir TUDO para desenvolvimento)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// 3. Configurar Autenticação JWT
var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:Key"]!);
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- ÁREA DE RESET DO BANCO DE DADOS (USAR APENAS EM DESENVOLVIMENTO) ---
// Isto vai apagar e recriar o banco sempre que o servidor reiniciar.
// Remove isto quando o sistema estiver estável!
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Apaga o banco antigo se existir (resolve o erro de "Table already exists")
    db.Database.EnsureDeleted(); 
    // Cria o banco novo limpo (sem precisar rodar 'dotnet ef database update')
    db.Database.Migrate();
}
// -------------------------------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication(); 
app.UseAuthorization();
app.MapControllers();

app.Run();