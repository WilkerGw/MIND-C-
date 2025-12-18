using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.Models;

namespace OticaERP.API.Controllers
{
    [Authorize] // Protege a rota: só quem fez login pode acessar
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClientsController(AppDbContext context)
        {
            _context = context;
        }

        // Listar todos os clientes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Client>>> GetClients()
        {
            return await _context.Clients.ToListAsync();
        }

        // Buscar cliente específico pelo CPF
        [HttpGet("cpf/{cpf}")]
        public async Task<ActionResult<Client>> GetClientByCpf(string cpf)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Cpf == cpf);
            if (client == null) return NotFound("Cliente não encontrado.");
            return client;
        }

        // Cadastrar novo cliente
        [HttpPost]
        public async Task<ActionResult<Client>> PostClient(Client client)
        {
            // Validação simples para evitar duplicidade
            if (await _context.Clients.AnyAsync(c => c.Cpf == client.Cpf))
                return BadRequest("Já existe um cliente com este CPF.");

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetClientByCpf), new { cpf = client.Cpf }, client);
        }
    }
}