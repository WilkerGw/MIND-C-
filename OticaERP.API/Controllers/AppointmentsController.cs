using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.DTOs;
using OticaERP.API.Models;

namespace OticaERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Appointments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointments()
        {
            // Agora trazemos a lista completa para exibir na própria tela de agendamentos
            return await _context.Appointments
                .Include(a => a.Client)
                .OrderBy(a => a.AppointmentDate) // Ordenar por data (mais recente/próximo)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    ClientId = a.ClientId,
                    ClientName = a.Client != null ? a.Client.FullName : "Cliente Removido",
                    AppointmentDate = a.AppointmentDate,
                    Observation = a.Observation,
                    Status = "Agendado" // Podemos evoluir isso para um campo no banco futuramente
                })
                .ToListAsync();
        }

        // POST: api/Appointments
        [HttpPost]
        public async Task<IActionResult> CreateAppointment(CreateAppointmentDto dto)
        {
            // 1. Validar Cliente
            var client = await _context.Clients.FindAsync(dto.ClientId);
            if (client == null) return NotFound("Cliente não encontrado.");

            // 2. Criar APENAS o Agendamento (Sem gerar O.S.)
            var appointment = new Appointment
            {
                ClientId = dto.ClientId,
                AppointmentDate = dto.AppointmentDate,
                Observation = dto.Observation
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAppointments), new { id = appointment.Id }, appointment);
        }

        // DELETE: api/Appointments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}