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
                .Include(so => so.Sale) // IMPORTANTE: Traz a venda para ler o Total e Entrada
                .OrderByDescending(so => so.CreatedAt)
                .Select(so => new ServiceOrderDto
                {
                    Id = so.Id,
                    ManualOrderNumber = so.ManualOrderNumber,
                    CreatedAt = so.CreatedAt,
                    DeliveryDate = so.DeliveryDate,
                    Status = so.Status,
                    ClientName = so.Client != null ? so.Client.FullName : "Cliente Removido",
                    ProductName = so.Product != null ? so.Product.Name : "Produto Diverso",
                    Description = so.Description,
                    ServiceType = so.ServiceType.ToString(),
                    
                    // Lógica: Se tem venda, pega de lá. Se não, usa 0.
                    TotalValue = so.Sale != null ? so.Sale.TotalValue : so.Price, 
                    EntryValue = so.Sale != null ? so.Sale.EntryValue : 0,
                    
                    // O campo Price na OS armazena o "Saldo a Pagar"
                    RemainingBalance = so.Price 
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
                .FirstOrDefaultAsync(s => s.Id == id);

            if (so == null) return NotFound("Ordem de Serviço não encontrada.");

            return new ServiceOrderDto
            {
                Id = so.Id,
                ManualOrderNumber = so.ManualOrderNumber,
                CreatedAt = so.CreatedAt,
                DeliveryDate = so.DeliveryDate,
                Status = so.Status,
                ClientName = so.Client != null ? so.Client.FullName : "Cliente Removido",
                ProductName = so.Product != null ? so.Product.Name : "Produto Diverso",
                Description = so.Description,
                ServiceType = so.ServiceType.ToString(),
                
                TotalValue = so.Sale != null ? so.Sale.TotalValue : so.Price,
                EntryValue = so.Sale != null ? so.Sale.EntryValue : 0,
                RemainingBalance = so.Price
            };
        }

        // PUT: api/ServiceOrders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateServiceOrder(int id, UpdateServiceOrderDto dto)
        {
            var order = await _context.ServiceOrders.FindAsync(id);
            if (order == null) return NotFound("Ordem de Serviço não encontrada.");

            if (!string.IsNullOrEmpty(dto.Status))
                order.Status = dto.Status;
            
            if (dto.DeliveryDate.HasValue)
                order.DeliveryDate = dto.DeliveryDate.Value;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/ServiceOrders/5/settle (NOVO: QUITAR SALDO)
        [HttpPut("{id}/settle")]
        public async Task<IActionResult> SettleBalance(int id)
        {
            var order = await _context.ServiceOrders.FindAsync(id);
            if (order == null) return NotFound("Ordem de Serviço não encontrada.");

            // Zera o saldo devedor
            order.Price = 0; 
            
            // Opcional: Poderíamos mudar o status para "Concluído" ou "Entregue" aqui se quiséssemos
            
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/ServiceOrders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteServiceOrder(int id)
        {
            var order = await _context.ServiceOrders.FindAsync(id);
            if (order == null) return NotFound("Ordem de Serviço não encontrada.");

            _context.ServiceOrders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}