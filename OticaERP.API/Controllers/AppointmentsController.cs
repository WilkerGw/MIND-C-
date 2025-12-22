using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            return await _context.Appointments
                .Include(a => a.Client)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Appointment>> GetAppointment(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Client)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (appointment == null)
            {
                return NotFound();
            }

            return appointment;
        }

        [HttpPost]
        public async Task<ActionResult<Appointment>> PostAppointment(Appointment appointment)
        {
             // Valida se o cliente existe
            if (appointment.ClientId > 0 && !await _context.Clients.AnyAsync(c => c.Id == appointment.ClientId))
            {
                return BadRequest("Cliente não encontrado.");
            }

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAppointment", new { id = appointment.Id }, appointment);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}