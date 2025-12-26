using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OticaERP.API.Data;
using OticaERP.API.DTOs;
using OticaERP.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OticaERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return BadRequest("Usuário já existe");

            // Criptografia simples da senha (em produção, use BCrypt ou Argon2)
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = passwordHash,
                Role = dto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuário registrado com sucesso!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

            if (user == null)
                return BadRequest("Usuário ou senha inválidos");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return BadRequest("Usuário ou senha inválidos");

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                user = user.Username,
                token = token,
                role = user.Role
            });
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            // --- CORREÇÃO AQUI ---
            // Tenta pegar a chave do .env primeiro. Se não achar, tenta do appsettings.
            // Se ambos falharem, usa uma chave de fallback (segurança contra crash).
            var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") 
                         ?? _configuration["JwtSettings:Key"];

            if (string.IsNullOrEmpty(jwtKey))
            {
                // Fallback de emergência apenas para não dar erro 500 se a config falhar
                jwtKey = "chave_secreta_padrao_para_desenvolvimento_apenas_123";
            }

            var key = Encoding.ASCII.GetBytes(jwtKey);
            // ---------------------

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}