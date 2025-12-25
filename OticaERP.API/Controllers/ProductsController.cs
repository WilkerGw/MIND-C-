using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.Models;

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

        // Listar produtos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        // Buscar produto pelo código
        [HttpGet("{code}")]
        public async Task<ActionResult<Product>> GetProductByCode(string code)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductCode == code);
            if (product == null) return NotFound("Produto não encontrado.");
            return product;
        }

        // Cadastrar produto
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            if (await _context.Products.AnyAsync(p => p.ProductCode == product.ProductCode))
                return BadRequest("Código do produto já existe.");

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProductByCode), new { code = product.ProductCode }, product);
        }

        // Importar CSV
        [HttpPost("import")]
        public async Task<IActionResult> ImportProducts(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Arquivo inválido.");

            using var stream = new StreamReader(file.OpenReadStream());
            var header = await stream.ReadLineAsync(); // Pula cabeçalho
            
            var productsToInsert = new List<Product>();
            int lineCount = 0;

            while (!stream.EndOfStream)
            {
                var line = await stream.ReadLineAsync();
                if (string.IsNullOrWhiteSpace(line)) continue;

                var parts = line.Split(',');
                if (parts.Length < 7) continue;

                // Mapeamento: codigo(1), nome(2), precoCusto(3), precoVenda(4), estoque(5), tipo(6)
                var product = new Product
                {
                    ProductCode = parts[1].Trim(),
                    Name = parts[2].Trim(),
                    CostPrice = decimal.TryParse(parts[3], out var cp) ? cp : 0,
                    SellingPrice = decimal.TryParse(parts[4], out var sp) ? sp : 0,
                    StockQuantity = int.TryParse(parts[5], out var sq) ? sq : 0,
                    Category = MapCategory(parts[6].Trim())
                };

                // Evita duplicatas dentro do lote ou no banco
                if (!productsToInsert.Any(p => p.ProductCode == product.ProductCode) &&
                    !await _context.Products.AnyAsync(p => p.ProductCode == product.ProductCode))
                {
                    productsToInsert.Add(product);
                }
                
                lineCount++;
            }

            if (productsToInsert.Any())
            {
                _context.Products.AddRange(productsToInsert);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = $"{productsToInsert.Count} produtos importados de {lineCount} linhas processadas." });
        }

        private int MapCategory(string tipo)
        {
            tipo = tipo.ToLower();
            if (tipo.Contains("grau") || tipo.Contains("armação")) return 0; // Armação
            if (tipo.Contains("lente")) return 1; // Lente
            if (tipo.Contains("sol")) return 2; // Óculos Solar
            if (tipo.Contains("serviço")) return 3; // Serviço
            return 0; // Padrão Armação
        }
    }
}