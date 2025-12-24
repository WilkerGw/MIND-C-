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
            return await _context.ServiceOrders
                .Include(so => so.Client)
                .Include(so => so.Product)
                .Include(so => so.Sale) // Importante: Incluir a Venda
                .Select(so => new ServiceOrderDto
                {
                    Id = so.Id,
                    ClientName = so.Client != null ? so.Client.FullName : "N/A",
                    ProductName = so.Product != null ? so.Product.Name : "N/A",
                    ServiceType = so.ServiceType.ToString(),
                    Status = so.Status,
                    CreatedAt = so.CreatedAt,
                    DeliveryDate = so.DeliveryDate,

                    // --- CÁLCULOS PRECISOS ---
                    // Se houver venda, usa os dados da venda. Se não, usa 0 ou o preço base.
                    TotalValue = so.Sale != null ? so.Sale.TotalValue : so.Price,
                    EntryValue = so.Sale != null ? so.Sale.EntryValue : 0,
                    RemainingValue = so.Sale != null ? (so.Sale.TotalValue - so.Sale.EntryValue) : so.Price
                })
                .ToListAsync();
        }

        // GET: api/ServiceOrders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceOrderDto>> GetServiceOrder(int id)
        {
            var so = await _context.ServiceOrders
                .Include(s => s.Client)
                .Include(s => s.Product)
                .Include(s => s.Sale)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (so == null) return NotFound();

            return new ServiceOrderDto
            {
                Id = so.Id,
                ClientName = so.Client?.FullName ?? "N/A",
                ProductName = so.Product?.Name ?? "N/A",
                ServiceType = so.ServiceType.ToString(),
                Status = so.Status,
                CreatedAt = so.CreatedAt,
                DeliveryDate = so.DeliveryDate,

                // --- CÁLCULOS PRECISOS ---
                TotalValue = so.Sale != null ? so.Sale.TotalValue : so.Price,
                EntryValue = so.Sale != null ? so.Sale.EntryValue : 0,
                RemainingValue = so.Sale != null ? (so.Sale.TotalValue - so.Sale.EntryValue) : so.Price
            };
        }

        // PUT: api/ServiceOrders/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
        {
            var serviceOrder = await _context.ServiceOrders.FindAsync(id);
            if (serviceOrder == null) return NotFound();

            serviceOrder.Status = newStatus;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}