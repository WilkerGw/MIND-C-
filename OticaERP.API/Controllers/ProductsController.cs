using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.Models;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace OticaERP.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        // GET: api/Products/by-code/{code}
        [HttpGet("by-code/{code}")]
        public async Task<ActionResult<Product>> GetProductByCode(string code)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductCode == code);

            if (product == null)
            {
                return NotFound(new { message = "Produto não encontrado." });
            }

            return Ok(product);
        }

        // POST: api/Products
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            if (await _context.Products.AnyAsync(p => p.ProductCode == product.ProductCode))
            {
                return BadRequest("Já existe um produto com este código.");
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProduct", new { id = product.Id }, product);
        }

        // PUT: api/Products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
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

        // DELETE: api/Products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // --- IMPORTAÇÃO DE PRODUTOS (AJUSTADO PARA SEU CSV) ---
        [HttpPost("import")]
        public async Task<IActionResult> ImportCsv(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Por favor, envie um arquivo CSV válido.");

            int successCount = 0;
            int errorCount = 0;
            var errors = new List<string>();

            // Encoding.Latin1 para acentos do Excel
            using (var stream = new StreamReader(file.OpenReadStream(), Encoding.Latin1))
            {
                // Pular cabeçalho
                var header = await stream.ReadLineAsync();

                while (!stream.EndOfStream)
                {
                    var line = await stream.ReadLineAsync();
                    if (string.IsNullOrWhiteSpace(line)) continue;

                    var values = line.Split(';');

                    // CSV esperado: codigo;nome;precoCusto;precoVenda;estoque;tipo
                    if (values.Length < 6)
                    {
                        errorCount++;
                        errors.Add($"Linha incompleta: {line}");
                        continue;
                    }

                    try
                    {
                        var codigo = values[0].Trim();

                        // Verifica duplicidade pelo Código
                        if (await _context.Products.AnyAsync(p => p.ProductCode == codigo))
                        {
                            errorCount++; 
                            continue;
                        }

                        // Função para converter "R$ 1.200,00" -> 1200.00
                        decimal ParseCurrency(string input)
                        {
                            var clean = Regex.Replace(input, @"[^\d,.-]", "").Trim();
                            if (decimal.TryParse(clean, NumberStyles.Number, new CultureInfo("pt-BR"), out decimal result))
                                return result;
                            return 0;
                        }

                        decimal costPrice = ParseCurrency(values[2]);
                        decimal sellingPrice = ParseCurrency(values[3]);

                        int.TryParse(values[4].Trim(), out int stock);

                        var newProduct = new Product
                        {
                            ProductCode = codigo,
                            Name = values[1].Trim(),
                            CostPrice = costPrice,
                            SellingPrice = sellingPrice,
                            StockQuantity = stock,
                            Category = values[5].Trim() // Agora aceita texto (ex: Armação)
                            // Description removido
                        };

                        _context.Products.Add(newProduct);
                        successCount++;
                    }
                    catch (Exception ex)
                    {
                        errorCount++;
                        errors.Add($"Erro linha '{line}': {ex.Message}");
                    }
                }

                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                Mensagem = "Importação concluída.",
                Importados = successCount,
                Ignorados = errorCount,
                Erros = errors.Count > 0 ? errors : null
            });
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}