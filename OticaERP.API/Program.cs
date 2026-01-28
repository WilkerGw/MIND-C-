using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models; // Necessário para configurar o Swagger Auth
using System.Text;
using DotNetEnv; 

var builder = WebApplication.CreateBuilder(args);

// --- 0. Carregar variáveis de ambiente ---
Env.Load();

// Registrar Serviços
builder.Services.AddScoped<OticaERP.API.Services.PrintingService>();
builder.Services.AddHttpClient();

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
        policy => policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173") // Permitir localhost e 127.0.0.1
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// 3. Configurar Autenticação JWT
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") 
             ?? builder.Configuration["JwtSettings:Key"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new Exception("FATAL: Variável de ambiente 'JWT_KEY' não configurada!");
}

var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false; // Em produção deve ser true se usar SSL real
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

// --- 4. CONFIGURAÇÃO DO SWAGGER COM CADEADO (Authorize) ---
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "OticaERP API", Version = "v1" });

    // Define o esquema de segurança (Bearer Token)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"Cabeçalho de autorização JWT usando o esquema Bearer. 
                      Entre com 'Bearer' [espaço] e então seu token no campo de texto abaixo.
                      Exemplo: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

// --- INICIALIZAÇÃO DO BANCO DE DADOS ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try 
    {
        Console.WriteLine("[AGUARDE] Aplicando Migrations no Supabase...");
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

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection(); // Forçar HTTPS apenas em produção
}

app.UseCors("AllowReactApp");
app.UseAuthentication(); 
app.UseAuthorization();
app.MapControllers();

app.Run();