using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.DTOs;
using OticaERP.API.Models;
using OticaERP.API.Services;

namespace OticaERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrintersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PrintingService _printingService;

        public PrintersController(AppDbContext context, PrintingService printingService)
        {
            _context = context;
            _printingService = printingService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Printer>>> GetPrinters()
        {
            return await _context.Printers.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Printer>> CreatePrinter(PrinterDto dto)
        {
            var printer = new Printer
            {
                Name = dto.Name,
                Model = dto.Model,
                SerialNumber = dto.SerialNumber,
                Type = dto.Type,
                ConnectionPath = dto.ConnectionPath,
                IsActive = dto.IsActive
            };

            _context.Printers.Add(printer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPrinters), new { id = printer.Id }, printer);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrinter(int id)
        {
            var printer = await _context.Printers.FindAsync(id);
            if (printer == null) return NotFound();

            _context.Printers.Remove(printer);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id}/test")]
        public async Task<IActionResult> TestPrint(int id)
        {
            try
            {
                await _printingService.PrintTestAsync(id);
                return Ok(new { message = "Comando de impressão enviado com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Erro na impressão: {ex.Message}" });
            }
        }
    }
}
