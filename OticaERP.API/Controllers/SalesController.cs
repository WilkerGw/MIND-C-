using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.DTOs;
using OticaERP.API.Models;
using System.Text;

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
            var sales = await _context.Sales
                .Include(s => s.Client)
                .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();

            // Transformar em DTO
            var dtos = sales.Select(s => new SaleDto
            {
                Id = s.Id,
                ClientName = s.Client != null ? s.Client.FullName : "Desconhecido",
                // Cria um resumo: "2x Lente Multifocal, 1x Armação RayBan"
                ProductsSummary = string.Join(", ", s.Items.Select(i => $"{i.Quantity}x {i.Product?.Name}")),
                TotalValue = s.TotalValue,
                EntryValue = s.EntryValue,
                SaleDate = s.SaleDate
            }).ToList();

            return Ok(dtos);
        }

        // POST: api/Sales
        [HttpPost]
        public async Task<IActionResult> CreateSale(CreateSaleDto dto)
        {
            if (!dto.CustomOsNumber.HasValue || dto.CustomOsNumber.Value <= 0)
            {
                return BadRequest("É obrigatório informar o Número da Ordem de Serviço manualmente.");
            }

            if (dto.Items == null || !dto.Items.Any())
            {
                return BadRequest("O carrinho de compras está vazio.");
            }

            // Verificar duplicidade da OS
            bool exists = await _context.ServiceOrders.AnyAsync(so => so.ManualOrderNumber == dto.CustomOsNumber.Value);
            if (exists)
            {
                return BadRequest($"Já existe uma Ordem de Serviço com o número {dto.CustomOsNumber.Value}.");
            }

            // Validar Cliente
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Cpf == dto.CpfCliente);
            if (client == null) return NotFound("Cliente não encontrado.");

            DateTime finalSaleDate = dto.SaleDate.HasValue
                ? dto.SaleDate.Value.ToUniversalTime()
                : DateTime.UtcNow;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Criar a Venda (Cabeçalho)
                var sale = new Sale
                {
                    ClientId = client.Id,
                    EntryValue = dto.EntryValue,
                    SaleDate = finalSaleDate,
                    Items = new List<SaleItem>()
                };

                decimal calculatedTotal = 0;
                var descriptionBuilder = new StringBuilder();
                descriptionBuilder.AppendLine("Itens da Venda:");

                // 2. Processar cada item do carrinho
                foreach (var itemDto in dto.Items)
                {
                    var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductCode == itemDto.ProductCode);
                    if (product == null) 
                        throw new Exception($"Produto com código {itemDto.ProductCode} não encontrado.");

                    if (product.StockQuantity < itemDto.Quantity)
                        throw new Exception($"Estoque insuficiente para {product.Name}. Disponível: {product.StockQuantity}");

                    // Abater estoque
                    product.StockQuantity -= itemDto.Quantity;

                    // Criar Item da Venda
                    var saleItem = new SaleItem
                    {
                        Product = product,
                        Quantity = itemDto.Quantity,
                        UnitPrice = product.SellingPrice,
                        SubTotal = product.SellingPrice * itemDto.Quantity
                    };

                    sale.Items.Add(saleItem);
                    calculatedTotal += saleItem.SubTotal;

                    // Adicionar à descrição da OS
                    descriptionBuilder.AppendLine($"- {itemDto.Quantity}x {product.Name} ({product.SellingPrice:C} un)");
                }

                sale.TotalValue = calculatedTotal;

                _context.Sales.Add(sale);
                await _context.SaveChangesAsync();

                // 3. Gerar OS Única para a Venda
                decimal remainingValue = sale.TotalValue - sale.EntryValue;
                descriptionBuilder.AppendLine($"Total: {sale.TotalValue:C}. Entrada: {sale.EntryValue:C}.");

                var serviceOrder = new ServiceOrder
                {
                    ServiceType = ServiceOrderType.Venda,
                    Status = "Aguardando Coleta",
                    Description = descriptionBuilder.ToString(),
                    Price = remainingValue,
                    ClientId = client.Id,
                    SaleId = sale.Id,
                    CreatedAt = finalSaleDate,
                    DeliveryDate = finalSaleDate.AddDays(7), // Previsão padrão de 7 dias
                    ManualOrderNumber = dto.CustomOsNumber.Value,
                    ProductId = null // Não vinculamos a um único produto, pois são vários
                };

                _context.ServiceOrders.Add(serviceOrder);
                await _context.SaveChangesAsync();

                // Atualizar Venda com ID da OS
                sale.ServiceOrderId = serviceOrder.Id;
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = "Venda realizada com sucesso!",
                    SaleId = sale.Id,
                    ServiceOrderId = serviceOrder.Id,
                    TotalValue = sale.TotalValue
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Erro ao processar venda: " + ex.Message);
            }
        }
    }
}