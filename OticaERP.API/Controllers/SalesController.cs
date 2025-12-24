using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.DTOs;
using OticaERP.API.Models;

namespace OticaERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SalesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Sales
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SaleDto>>> GetSales()
        {
            return await _context.Sales
                .Include(s => s.Client)
                .Include(s => s.Product)
                .Select(s => new SaleDto
                {
                    Id = s.Id,
                    ClientName = s.Client != null ? s.Client.FullName : "Desconhecido",
                    ProductName = s.Product != null ? s.Product.Name : "Desconhecido",
                    Quantity = s.Quantity,
                    TotalValue = s.TotalValue,
                    EntryValue = s.EntryValue, // Retorna o valor
                    SaleDate = s.SaleDate
                })
                .ToListAsync();
        }

        // POST: api/Sales
        [HttpPost]
        public async Task<IActionResult> CreateSale(CreateSaleDto dto)
        {
            // 1. Validar Produto
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductCode == dto.CodigoProduto);
            if (product == null) return NotFound("Produto não encontrado.");

            if (product.StockQuantity < dto.Quantity) 
                return BadRequest($"Estoque insuficiente. Disponível: {product.StockQuantity}");

            // 2. Validar Cliente
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Cpf == dto.CpfCliente);
            if (client == null) return NotFound("Cliente não encontrado.");

            // 3. Transação
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var sale = new Sale
                {
                    ClientId = client.Id,
                    ProductId = product.Id,
                    Quantity = dto.Quantity,
                    TotalValue = dto.ValorTotal,
                    EntryValue = dto.EntryValue, // GRAVA O VALOR DE ENTRADA
                    SaleDate = DateTime.UtcNow
                };

                // Atualizar Estoque
                product.StockQuantity -= dto.Quantity;

                _context.Sales.Add(sale);
                await _context.SaveChangesAsync();

                // 4. Gerar OS Automática
                // Calcula o valor restante (Total - Entrada) para constar na OS
                decimal remainingValue = dto.ValorTotal - dto.EntryValue;

                var serviceOrder = new ServiceOrder
                {
                    ServiceType = ServiceOrderType.Venda, 
                    Status = "Pendente", // Se deve valor, fica pendente? (Ajustável)
                    Description = $"Venda: {dto.Quantity}x {product.Name}. Total: {dto.ValorTotal:C}. Entrada: {dto.EntryValue:C}.",
                    Price = remainingValue, // Salva o que falta pagar na OS (ou o total, dependendo da tua regra)
                    ProductId = product.Id,
                    ClientId = client.Id,
                    SaleId = sale.Id,
                    CreatedAt = DateTime.UtcNow,
                    DeliveryDate = DateTime.UtcNow
                };

                _context.ServiceOrders.Add(serviceOrder);
                await _context.SaveChangesAsync();

                sale.ServiceOrderId = serviceOrder.Id;
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { Message = "Venda realizada com sucesso!", SaleId = sale.Id, ServiceOrderId = serviceOrder.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Erro ao processar venda: " + ex.Message);
            }
        }
    }
}