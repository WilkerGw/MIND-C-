using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.DTOs;
using OticaERP.API.Models;

namespace OticaERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Dashboard/stats
        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetStats()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            
            // Período Comparativo (Mesmo dia ano passado)
            var lastYearDate = today.AddYears(-1);
            
            // 1. Vendas Totais do Dia (Hoje)
            var dailySales = await _context.Sales
                .Where(s => s.SaleDate >= today && s.SaleDate < today.AddDays(1))
                .SumAsync(s => s.TotalValue);

            // 2. Vendas Totais do Dia (Ano Passado)
            var lastYearSales = await _context.Sales
                .Where(s => s.SaleDate >= lastYearDate && s.SaleDate < lastYearDate.AddDays(1))
                .SumAsync(s => s.TotalValue);

            // 3. Vendas Totais do Mês Atual
            var monthlySales = await _context.Sales
                .Where(s => s.SaleDate >= startOfMonth)
                .SumAsync(s => s.TotalValue);

            // 4. Vendas Totais do Mês (Ano Passado)
            var startOfLastYearMonth = startOfMonth.AddYears(-1);
            var endOfLastYearMonth = startOfLastYearMonth.AddMonths(1);

            var monthlySalesPreviousYear = await _context.Sales
                .Where(s => s.SaleDate >= startOfLastYearMonth && s.SaleDate < endOfLastYearMonth)
                .SumAsync(s => s.TotalValue);

            // 5. Ordens de Serviço em Aberto (Status != "Entregue")
            var activeOrders = await _context.ServiceOrders
                .CountAsync(so => so.Status != "Entregue" && so.Status != "Concluído");

            return Ok(new DashboardStatsDto
            {
                DailySalesTotal = dailySales,
                DailySalesPreviousYear = lastYearSales,
                MonthlySalesTotal = monthlySales,
                MonthlySalesPreviousYear = monthlySalesPreviousYear,
                ActiveServiceOrdersCount = activeOrders
            });
        }

        // GET: api/Dashboard/sales-history
        [HttpGet("sales-history")]
        public async Task<ActionResult<IEnumerable<SalesHistoryDto>>> GetSalesHistory()
        {
            // Últimos 20 meses
            var startDate = DateTime.UtcNow.AddMonths(-19); // 19 meses atrás + mês atual = 20 meses
            startDate = new DateTime(startDate.Year, startDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var salesData = await _context.Sales
                .Where(s => s.SaleDate >= startDate)
                .GroupBy(s => new { s.SaleDate.Year, s.SaleDate.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Total = g.Sum(s => s.TotalValue)
                })
                .OrderBy(r => r.Year).ThenBy(r => r.Month)
                .ToListAsync();

            // Preencher meses vazios com 0 (opcional, mas bom para gráficos)
            // Aqui vamos retornar apenas os meses que tem dados ou fazer mapping simples
            // O frontend pode tratar gaps ou podemos melhorar isso aqui se necessário. 
            // Para simplificar, vou mapear direto os resultados do banco.
            
            var result = salesData.Select(d => new SalesHistoryDto
            {
                Period = $"{d.Month:D2}/{d.Year}",
                TotalValue = d.Total
            }).ToList();

            return Ok(result);
        }

        // GET: api/Dashboard/active-orders
        [HttpGet("active-orders")]
        public async Task<ActionResult<IEnumerable<ServiceOrderDto>>> GetActiveOrders()
        {
            // Retorna as 10 ordens de serviço mais antigas (prioridade) ou recentes que não foram entregues
            var orders = await _context.ServiceOrders
                .Include(so => so.Client)
                .Include(so => so.Product)
                .Include(so => so.Sale)
                .Where(so => so.Status != "Entregue" && so.Status != "Concluído")
                .OrderBy(so => so.DeliveryDate) // Ordena pela data de entrega (mais urgentes primeiro)
                .Take(10) // Limita a 10 para o dashboard não ficar gigante
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
                    TotalValue = so.Sale != null ? so.Sale.TotalValue : so.Price,
                    EntryValue = so.Sale != null ? so.Sale.EntryValue : 0,
                    RemainingBalance = so.Price
                })
                .ToListAsync();

            return Ok(orders);
        }
    }
}
