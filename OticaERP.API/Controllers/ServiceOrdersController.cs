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
    public class ServiceOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServiceOrdersController(AppDbContext context)
        {
            _context = context;
        }

        // Listar todas as Ordens de Serviço (Vendas e Exames)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceOrder>>> GetServiceOrders()
        {
            // O Include serve para trazer os dados "filhos" (Nome do cliente, produto vendido, etc)
            return await _context.ServiceOrders
                .Include(os => os.Sale).ThenInclude(s => s.Client)
                .Include(os => os.Appointment).ThenInclude(a => a.Client)
                .OrderByDescending(os => os.CreatedDate) // Mais recentes primeiro
                .ToListAsync();
        }

        // Atualizar Status (ex: "Montagem Finalizada", "Compareceu")
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
        {
            var order = await _context.ServiceOrders.FindAsync(id);
            if (order == null) return NotFound();

            order.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Status atualizado.", Order = order });
        }
        
        // Atualizar Resultado do Exame (ex: "Comprou", "Não Comprou")
        [HttpPut("{id}/exam-result")]
        public async Task<IActionResult> UpdateExamResult(int id, [FromBody] string result)
        {
            var order = await _context.ServiceOrders.FindAsync(id);
            if (order == null) return NotFound();
            
            if (order.Type != ServiceOrderType.Exame) 
                return BadRequest("Apenas exames podem ter resultado de compra.");

            order.ExamResult = result;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Resultado do exame atualizado.", Order = order });
        }
    }
}