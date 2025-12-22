using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.DTOs;
using OticaERP.API.Models;

namespace OticaERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServiceOrdersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ServiceOrders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceOrderDto>>> GetServiceOrders()
        {
            var serviceOrders = await _context.ServiceOrders
                .Include(so => so.Client)
                .Include(so => so.Product)
                .Select(so => new ServiceOrderDto
                {
                    Id = so.Id,
                    ClientId = so.ClientId,
                    // CORREÇÃO: Usando FullName conforme o modelo Client
                    ClientName = so.Client != null ? so.Client.FullName : "Cliente não encontrado",
                    
                    ProductId = so.ProductId,
                    ProductName = so.Product != null ? so.Product.Name : "Produto não encontrado",
                    
                    ServiceType = so.ServiceType.ToString(),
                    Description = so.Description,
                    Price = so.Price,
                    Status = so.Status,
                    CreatedAt = so.CreatedAt,
                    DeliveryDate = so.DeliveryDate
                })
                .ToListAsync();

            return Ok(serviceOrders);
        }

        // GET: api/ServiceOrders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceOrderDto>> GetServiceOrder(int id)
        {
            var so = await _context.ServiceOrders
                .Include(s => s.Client)
                .Include(s => s.Product)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (so == null)
            {
                return NotFound();
            }

            var dto = new ServiceOrderDto
            {
                Id = so.Id,
                ClientId = so.ClientId,
                // CORREÇÃO: Usando FullName
                ClientName = so.Client != null ? so.Client.FullName : "Cliente não encontrado",
                
                ProductId = so.ProductId,
                ProductName = so.Product != null ? so.Product.Name : "Produto não encontrado",
                
                ServiceType = so.ServiceType.ToString(),
                Description = so.Description,
                Price = so.Price,
                Status = so.Status,
                CreatedAt = so.CreatedAt,
                DeliveryDate = so.DeliveryDate
            };

            return Ok(dto);
        }

        // POST: api/ServiceOrders
        [HttpPost]
        public async Task<ActionResult<ServiceOrder>> PostServiceOrder(CreateServiceOrderDto dto)
        {
            var client = await _context.Clients.FindAsync(dto.ClientId);
            if (client == null) return BadRequest("Cliente não encontrado.");

            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null) return BadRequest("Produto não encontrado.");

            if (!Enum.TryParse<ServiceOrderType>(dto.ServiceType, out var serviceTypeEnum))
            {
                return BadRequest("Tipo de serviço inválido.");
            }

            var serviceOrder = new ServiceOrder
            {
                ClientId = dto.ClientId,
                ProductId = dto.ProductId,
                ServiceType = serviceTypeEnum,
                Description = dto.Description,
                Price = dto.Price,
                Status = "Pendente",
                CreatedAt = DateTime.UtcNow,
                DeliveryDate = dto.DeliveryDate
            };

            _context.ServiceOrders.Add(serviceOrder);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetServiceOrder", new { id = serviceOrder.Id }, new ServiceOrderDto 
            {
                Id = serviceOrder.Id,
                ClientId = serviceOrder.ClientId,
                // CORREÇÃO: Usando FullName
                ClientName = client.FullName,
                ProductId = serviceOrder.ProductId,
                ProductName = product.Name,
                ServiceType = serviceOrder.ServiceType.ToString(),
                Description = serviceOrder.Description,
                Price = serviceOrder.Price,
                Status = serviceOrder.Status,
                CreatedAt = serviceOrder.CreatedAt,
                DeliveryDate = serviceOrder.DeliveryDate
            });
        }

        // PUT: api/ServiceOrders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateServiceOrderStatusDto dto)
        {
            var serviceOrder = await _context.ServiceOrders.FindAsync(id);
            if (serviceOrder == null)
            {
                return NotFound();
            }

            serviceOrder.Status = dto.Status;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}