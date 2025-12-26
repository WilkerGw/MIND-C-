using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.Models;
using System.Globalization;
using System.Text; // Importante para o Encoding

namespace OticaERP.API.Controllers
{
    [Authorize]
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
            return await _context.Clients.OrderBy(c => c.FullName).ToListAsync();
        }

        // GET: api/Clients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Client>> GetClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound();
            }

            return client;
        }

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

            return CreatedAtAction("GetClient", new { id = client.Id }, client);
        }

        // PUT: api/Clients/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutClient(int id, Client client)
        {
            if (id != client.Id)
            {
                return BadRequest();
            }

            _context.Entry(client).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClientExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Clients/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
            {
                return NotFound();
            }

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // --- IMPORTAÇÃO DE CSV (CORRIGIDO ENCODING) ---
        [HttpPost("import")]
        public async Task<IActionResult> ImportCsv(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Por favor, envie um arquivo CSV válido.");

            int successCount = 0;
            int errorCount = 0;
            var errors = new List<string>();

            // MUDANÇA AQUI: Forçamos o Encoding.Latin1 para ler corretamente acentos do Excel/Windows
            using (var stream = new StreamReader(file.OpenReadStream(), Encoding.Latin1))
            {
                var header = await stream.ReadLineAsync();
                
                while (!stream.EndOfStream)
                {
                    var line = await stream.ReadLineAsync();
                    if (string.IsNullOrWhiteSpace(line)) continue;

                    var values = line.Split(';');

                    if (values.Length < 9)
                    {
                        errorCount++;
                        errors.Add($"Linha com colunas insuficientes: {line}");
                        continue;
                    }

                    try
                    {
                        var cpf = values[1].Trim();

                        if (await _context.Clients.AnyAsync(c => c.Cpf == cpf))
                        {
                            errorCount++; 
                            continue;
                        }

                        DateTime? dataNascimento = null;
                        if (DateTime.TryParseExact(values[3], "dd/MM/yyyy HH:mm", 
                            new CultureInfo("pt-BR"), DateTimeStyles.None, out DateTime parsedDate))
                        {
                            dataNascimento = parsedDate;
                        }

                        // Removemos o campo Email, já que ele foi retirado do Modelo
                        var newClient = new Client
                        {
                            FullName = values[0].Trim(),
                            Cpf = cpf,
                            Phone = values[2].Trim(),
                            DateOfBirth = dataNascimento,
                            Gender = values[4].Trim(),
                            ZipCode = values[5].Trim(),
                            Street = values[6].Trim(),
                            District = values[7].Trim(),
                            City = values[8].Trim(),
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.Clients.Add(newClient);
                        successCount++;
                    }
                    catch (Exception ex)
                    {
                        errorCount++;
                        errors.Add($"Erro ao processar linha: {line}. Detalhe: {ex.Message}");
                    }
                }

                await _context.SaveChangesAsync();
            }

            return Ok(new 
            { 
                Mensagem = "Processo de importação finalizado.",
                ClientesImportados = successCount,
                ClientesIgnorados = errorCount,
                Erros = errors.Count > 0 ? errors : null
            });
        }

        private bool ClientExists(int id)
        {
            return _context.Clients.Any(e => e.Id == id);
        }
    }
}