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
    }
}