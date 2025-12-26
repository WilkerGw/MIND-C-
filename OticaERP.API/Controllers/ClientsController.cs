using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.Models;

namespace OticaERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClientsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Clients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Client>>> GetClients()
        {
            return await _context.Clients.OrderByDescending(c => c.Id).ToListAsync();
        }

        // --- NOVO MÉTODO: BUSCAR POR CPF ---
        [HttpGet("by-cpf/{cpf}")]
        public async Task<ActionResult<Client>> GetClientByCpf(string cpf)
        {
            // Remove pontuação se vier
            var cleanCpf = cpf.Replace(".", "").Replace("-", "");
            
            // Busca exata (considerando que no banco está salvo limpo ou formatado, aqui buscamos 'Contains' ou exato.
            // O ideal é exato. Vamos assumir que você digita igual ao cadastro)
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Cpf == cpf);

            if (client == null)
            {
                return NotFound(new { message = "Cliente não encontrado." });
            }

            return Ok(client);
        }
        // -----------------------------------

        // POST: api/Clients
        [HttpPost]
        public async Task<ActionResult<Client>> PostClient(Client client)
        {
            if (await _context.Clients.AnyAsync(c => c.Cpf == client.Cpf))
            {
                return BadRequest("Já existe um cliente cadastrado com este CPF.");
            }

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetClients), new { id = client.Id }, client);
        }
    }
}