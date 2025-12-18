using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.DTOs; // Importante
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

        // Listar todas as Ordens de Serviço
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceOrder>>> GetServiceOrders()
        {
            return await _context.ServiceOrders
                .Include(os => os.Sale).ThenInclude(s => s.Client)
                .Include(os => os.Appointment).ThenInclude(a => a.Client)
                .OrderByDescending(os => os.CreatedDate)
                .ToListAsync();
        }

        // Atualizar Status (Usa o novo DTO)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var order = await _context.ServiceOrders.FindAsync(id);
            if (order == null) return NotFound();

            order.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Status atualizado.", Order = order });
        }
        
        // Atualizar Resultado do Exame (Usa o novo DTO)
        [HttpPut("{id}/exam-result")]
        public async Task<IActionResult> UpdateExamResult(int id, [FromBody] UpdateExamResultDto dto)
        {
            var order = await _context.ServiceOrders.FindAsync(id);
            if (order == null) return NotFound();
            
            if (order.Type != ServiceOrderType.Exame) 
                return BadRequest("Apenas exames podem ter resultado de compra.");

            order.ExamResult = dto.Result;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Resultado do exame atualizado.", Order = order });
        }
    }
}