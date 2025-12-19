using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.DTOs;
using OticaERP.API.Models;
using iText.Kernel.Pdf;
using iText.Kernel.Font;
using iText.IO.Font.Constants;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using System.IO;

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
                .Include(os => os.Sale).ThenInclude(s => s.Product) // Inclui Produto para o PDF
                .Include(os => os.Appointment).ThenInclude(a => a.Client)
                .OrderByDescending(os => os.CreatedDate)
                .ToListAsync();
        }

        // Atualizar Status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var order = await _context.ServiceOrders.FindAsync(id);
            if (order == null) return NotFound();

            order.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Status atualizado.", Order = order });
        }
        
        // Atualizar Resultado do Exame
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

        // GERAR PDF DA ORDEM DE SERVIÇO
        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> GeneratePdf(int id)
        {
            var order = await _context.ServiceOrders
                .Include(os => os.Sale).ThenInclude(s => s.Client)
                .Include(os => os.Sale).ThenInclude(s => s.Product)
                .Include(os => os.Appointment).ThenInclude(a => a.Client)
                .FirstOrDefaultAsync(os => os.Id == id);

            if (order == null) return NotFound("Ordem de serviço não encontrada.");

            using (var memoryStream = new MemoryStream())
            {
                var writer = new PdfWriter(memoryStream);
                var pdf = new PdfDocument(writer);
                var document = new Document(pdf);
                
                var fontBold = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

                // Cabeçalho
                // Cabeçalho
                document.Add(new Paragraph(new Text($"ORDEM DE SERVIÇO #{order.Id}").SetFont(fontBold).SetFontSize(20))
                    .SetTextAlignment(TextAlignment.CENTER));

                document.Add(new Paragraph($"Data: {order.CreatedDate:dd/MM/yyyy HH:mm}")
                    .SetTextAlignment(TextAlignment.CENTER));
                
                document.Add(new Paragraph("\n"));

                // Detalhes
                if (order.Type == ServiceOrderType.Venda && order.Sale != null)
                {
                    document.Add(new Paragraph(new Text($"CLIENTE: {order.Sale.Client?.FullName ?? "N/A"}").SetFont(fontBold)));
                    document.Add(new Paragraph($"CPF: {order.Sale.Client?.Cpf ?? "N/A"}"));
                    document.Add(new Paragraph("--------------------------------------------------"));
                    document.Add(new Paragraph(new Text("PRODUTO VENDIDO:").SetFont(fontBold)));
                    document.Add(new Paragraph($"{order.Sale.Product?.Name} (Cód: {order.Sale.Product?.ProductCode})"));
                    document.Add(new Paragraph(new Text($"VALOR TOTAL: {order.Sale.TotalValue:C}").SetFont(fontBold)));
                    document.Add(new Paragraph($"STATUS ATUAL: {order.Status}"));
                }
                else if (order.Type == ServiceOrderType.Exame && order.Appointment != null)
                {
                    document.Add(new Paragraph(new Text($"PACIENTE: {order.Appointment.Client?.FullName ?? "N/A"}").SetFont(fontBold)));
                    document.Add(new Paragraph($"TELEFONE: {order.Appointment.Client?.Phone ?? "N/A"}"));
                    document.Add(new Paragraph("--------------------------------------------------"));
                    document.Add(new Paragraph(new Text("AGENDAMENTO DE EXAME").SetFont(fontBold)));
                    document.Add(new Paragraph($"Data/Hora: {order.Appointment.AppointmentDate:dd/MM/yyyy HH:mm}"));
                    document.Add(new Paragraph($"STATUS: {order.Status}"));
                    
                     if (!string.IsNullOrEmpty(order.ExamResult))
                    {
                        document.Add(new Paragraph(new Text($"RESULTADO: {order.ExamResult}").SetFont(fontBold)));
                    }
                }
                else if (order.Type == ServiceOrderType.Manutencao)
                {
                     document.Add(new Paragraph(new Text("MANUTENÇÃO DE ÓCULOS").SetFont(fontBold)));
                     document.Add(new Paragraph($"STATUS: {order.Status}"));
                }

                // Rodapé
                document.Add(new Paragraph("\n\n\n"));
                document.Add(new Paragraph("_____________________________").SetTextAlignment(TextAlignment.CENTER));
                document.Add(new Paragraph("Assinatura do Responsável").SetTextAlignment(TextAlignment.CENTER));

                document.Close();

                return File(memoryStream.ToArray(), "application/pdf", $"OS_{order.Id}.pdf");
            }
        }
    }
}