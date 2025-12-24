using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.DTOs;
using OticaERP.API.Models;

namespace OticaERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrescriptionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PrescriptionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Prescriptions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetPrescriptions()
        {
            return await _context.Prescriptions
                .Include(p => p.Client)
                .OrderByDescending(p => p.ExamDate)
                .Select(p => new PrescriptionDto
                {
                    Id = p.Id,
                    ClientId = p.ClientId,
                    ClientName = p.Client != null ? p.Client.FullName : "Cliente Removido",
                    ExamDate = p.ExamDate,
                    OdEsferico = p.OdEsferico,
                    OdCilindrico = p.OdCilindrico,
                    OdEixo = p.OdEixo,
                    OeEsferico = p.OeEsferico,
                    OeCilindrico = p.OeCilindrico,
                    OeEixo = p.OeEixo,
                    Dnp = p.Dnp,
                    Adicao = p.Adicao,
                    Altura = p.Altura,
                    Observation = p.Observation
                })
                .ToListAsync();
        }

        // POST: api/Prescriptions
        [HttpPost]
        public async Task<IActionResult> CreatePrescription(CreatePrescriptionDto dto)
        {
            var prescription = new Prescription
            {
                ClientId = dto.ClientId,
                ExamDate = dto.ExamDate,
                OdEsferico = dto.OdEsferico,
                OdCilindrico = dto.OdCilindrico,
                OdEixo = dto.OdEixo,
                OeEsferico = dto.OeEsferico,
                OeCilindrico = dto.OeCilindrico,
                OeEixo = dto.OeEixo,
                Dnp = dto.Dnp,
                Adicao = dto.Adicao,
                Altura = dto.Altura,
                Observation = dto.Observation
            };

            _context.Prescriptions.Add(prescription);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Receita salva com sucesso!" });
        }
        
        // DELETE: api/Prescriptions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrescription(int id)
        {
            var prescription = await _context.Prescriptions.FindAsync(id);
            if (prescription == null) return NotFound();

            _context.Prescriptions.Remove(prescription);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}