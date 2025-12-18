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
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentsController(AppDbContext context)
        {
            _context = context;
        }

        // Listar agendamentos (trazendo dados do cliente junto)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            return await _context.Appointments.Include(a => a.Client).ToListAsync();
        }

        // Criar Agendamento + Ordem de Serviço Automática
        [HttpPost]
        public async Task<IActionResult> CreateAppointment(Appointment appointment)
        {
            // Valida se o cliente existe
            var client = await _context.Clients.FindAsync(appointment.ClientId);
            if (client == null) return BadRequest("Cliente inválido.");

            // Abre uma transação (tudo ou nada)
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Salvar Agendamento
                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                // 2. Gerar Ordem de Serviço Automática (Tipo Exame)
                var serviceOrder = new ServiceOrder
                {
                    Type = ServiceOrderType.Exame,
                    Status = "Agendado", // Status inicial pedido
                    AppointmentId = appointment.Id,
                    ClientId = appointment.ClientId,
                    CreatedDate = DateTime.UtcNow
                };

                _context.ServiceOrders.Add(serviceOrder);
                await _context.SaveChangesAsync();

                // Confirma as duas operações
                await transaction.CommitAsync();
                
                return Ok(new { 
                    Message = "Agendamento realizado e OS gerada com sucesso.", 
                    AppointmentId = appointment.Id 
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(); // Desfaz tudo se der erro
                return StatusCode(500, "Erro ao criar agendamento: " + ex.Message);
            }
        }
    }
}