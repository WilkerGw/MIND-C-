using ESCPOS_NET;
using ESCPOS_NET.Emitters;
using ESCPOS_NET.Utilities;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.Models;
using OticaERP.API.Helpers;
using System.Text;
using System.Runtime.InteropServices;

namespace OticaERP.API.Services
{
    public class PrintingService
    {
        private readonly AppDbContext _context;

        public PrintingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task PrintTestAsync(int printerId)
        {
            var printer = await _context.Printers.FindAsync(printerId);
            if (printer == null) throw new Exception("Impressora não encontrada.");

            if (!printer.IsActive) throw new Exception("Impressora está inativa.");

            var e = new EPSON();
            var payload = ByteSplicer.Combine(
                e.CenterAlign(),                e.PrintLine("--------------------------------"),
                e.PrintLine("TESTE DE IMPRESSÃO - OTICA ERP"),
                e.PrintLine("--------------------------------"),
                e.LeftAlign(),
                e.PrintLine($"Impressora: {printer.Name}"),
                e.PrintLine($"Modelo: {printer.Model}"),
                e.PrintLine($"Data: {DateTime.Now}"),
                e.PrintLine("--------------------------------"),
                e.CenterAlign(),                e.PrintLine("Se você está lendo isso,"),
                e.PrintLine("a configuração funcionou!"),
                e.FeedLines(3),
                e.FullCutAfterFeed(3)
            );

            SendPayload(printer.ConnectionPath, payload);
        }

        public async Task PrintSaleAsync(int saleId, int printerId)
        {
            var sale = await _context.Sales
                .Include(s => s.Client)
                .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(s => s.Id == saleId);

            if (sale == null) throw new Exception("Venda não encontrada.");

            var printer = await _context.Printers.FindAsync(printerId);
            if (printer == null) throw new Exception("Impressora não encontrada.");
            
            var e = new EPSON();
            var payload = ByteSplicer.Combine(
                e.CenterAlign(),                e.SetStyles(PrintStyle.Bold),
                e.PrintLine("OTICA VIZZ"),
                e.SetStyles(PrintStyle.None),
                e.PrintLine("Avenida do Oratório, 4869 - Jd Guairaca"),
                e.PrintLine("Tel: (11) 2362-8799"),
                e.PrintLine("--------------------------------"), // 32 chars para 58mm/80mm ajustável
                e.LeftAlign(),
                e.PrintLine($"OS/Venda: #{sale.Id}"),
                e.PrintLine($"Data: {sale.SaleDate:dd/MM/yyyy HH:mm}"),
                e.PrintLine($"Cliente: {sale.Client?.FullName ?? "Consumidor"}"),
                e.PrintLine("--------------------------------"),
                e.SetStyles(PrintStyle.Bold),
                e.PrintLine("ITEM   QTD   VALOR   TOTAL"),
                e.SetStyles(PrintStyle.None)
            );

            decimal subTotalItems = 0;
            foreach (var item in sale.Items)
            {
                 decimal itemTotal = item.Quantity * item.UnitPrice;
                 subTotalItems += itemTotal;

                 string nomeProd = item.Product?.Name ?? "Item";
                 if (nomeProd.Length > 16) nomeProd = nomeProd.Substring(0, 16);
                 
                 payload = ByteSplicer.Combine(payload, 
                    e.PrintLine($"{nomeProd,-16} {item.Quantity}x {item.UnitPrice:F2} = {itemTotal:F2}")
                 );
            }

            decimal discount = subTotalItems - sale.TotalValue;

            payload = ByteSplicer.Combine(payload,
                e.PrintLine("--------------------------------"),
                e.RightAlign(),
                e.SetStyles(PrintStyle.Bold));

            if (discount > 0.01m)
            {
                payload = ByteSplicer.Combine(payload,
                    e.PrintLine($"SUBTOTAL: R$ {subTotalItems:F2}"),
                    e.PrintLine($"DESCONTO: R$ {discount:F2}")
                );
            }

            payload = ByteSplicer.Combine(payload,
                e.PrintLine($"TOTAL: R$ {sale.TotalValue:F2}"),
                 e.PrintLine($"ENTRADA: R$ {sale.EntryValue:F2}"),
                 e.PrintLine($"A PAGAR: R$ {(sale.TotalValue - sale.EntryValue):F2}"),
                e.SetStyles(PrintStyle.None),
                e.CenterAlign(),                e.PrintLine("--------------------------------"),
                e.PrintLine("Documento sem valor fiscal"),
                e.PrintLine("Obrigado pela preferência!"),
                e.FeedLines(3),
                e.FullCutAfterFeed(3)
            );

            SendPayload(printer.ConnectionPath, payload);
        }

        private void SendPayload(string connectionPath, byte[] payload)
        {
            if (connectionPath.StartsWith(@"\\"))
            {
                // Compartilhamento Windows (SMB/Local Share) -> Usa Helper RAW (WinSpool)
                // Para funcionar, precisa do nome da impressora ou caminho de compartilhamento.
                // RawPrinterHelper espera o nome da impressora (local ou compartilhado).
                string printerName = connectionPath;
                
                // Se for \\localhost\NOMEDAIMPRESSORA, podemos tentar mandar só NOMEDAIMPRESSORA se estiver instalada localmente,
                // mas mandar o caminho completo UNC também costuma funcionar com OpenPrinter.
                // Vamos tentar o caminho UNC direto primeiro.
                
                bool success = RawPrinterHelper.SendBytesToPrinter(printerName, payload);
                if (!success)
                {
                    // Tenta extrair apenas o nome do compartilhamento se falhar
                     var parts = connectionPath.Split('\\');
                     if (parts.Length > 0)
                     {
                         var shareName = parts[parts.Length - 1];
                         if (!RawPrinterHelper.SendBytesToPrinter(shareName, payload))
                         {
                              throw new Exception($"Erro ao imprimir via RAW em {printerName} (Win32 Error: {Marshal.GetLastWin32Error()})");
                         }
                     }
                     else
                     {
                         throw new Exception($"Erro ao imprimir via RAW em {printerName} (Win32 Error: {Marshal.GetLastWin32Error()})");
                     }
                }
            }
            else
            {
                // Assume IP
                BasePrinter printerDevice;
                 var parts = connectionPath.Split(':');
                 string ip = parts[0];
                 int port = parts.Length > 1 ? int.Parse(parts[1]) : 9100;
                 printerDevice = new NetworkPrinter(settings: new NetworkPrinterSettings() { ConnectionString = $"{ip}:{port}" });
                 
                 try 
                 {
                    printerDevice.Write(payload);
                 }
                 finally
                 {
                    printerDevice.Dispose();
                 }
            }
        }
    }
}

