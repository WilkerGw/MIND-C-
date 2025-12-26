using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DotNetEnv; 

var builder = WebApplication.CreateBuilder(args);

// --- 0. Carregar variáveis de ambiente ---
Env.Load();

// --- DIAGNÓSTICO DE CONEXÃO ---
var envConnectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
var appSettingsConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");

var connectionString = !string.IsNullOrEmpty(envConnectionString) 
                       ? envConnectionString 
                       : appSettingsConnectionString;

if (string.IsNullOrEmpty(connectionString))
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine("ERRO FATAL: Connection String não encontrada!");
    return; 
}

// --- CONFIGURAÇÃO DE PORTA ---
builder.WebHost.UseUrls("http://*:5200");

// 1. Configurar Banco de Dados
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// 3. Configurar Autenticação JWT
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") 
             ?? builder.Configuration["JwtSettings:Key"];

if (string.IsNullOrEmpty(jwtKey))
{
    jwtKey = "chave_secreta_padrao_para_desenvolvimento_apenas_123"; 
}

var key = Encoding.ASCII.GetBytes(jwtKey);

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

// --- INICIALIZAÇÃO DO BANCO DE DADOS (VERSÃO CORRIGIDA) ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try 
    {
        Console.WriteLine("[AGUARDE] Aplicando Migrations no Supabase...");
        
        // MUDANÇA FUNDAMENTAL: .Migrate() força a criação das tabelas
        db.Database.Migrate();
        
        Console.WriteLine("[SUCESSO] Tabelas criadas/atualizadas com sucesso!");
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"[ERRO AO CRIAR TABELAS] {ex.Message}");
        if(ex.InnerException != null)
             Console.WriteLine($"[DETALHE] {ex.InnerException.Message}");
        Console.ResetColor();
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowReactApp");
app.UseAuthentication(); 
app.UseAuthorization();
app.MapControllers();

app.Run();