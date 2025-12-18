using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OticaERP.API.Data;
using OticaERP.API.DTOs;
using OticaERP.API.Models;

namespace OticaERP.API.Controllers
{
    [Authorize] // Exige estar logado
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SalesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSale(SaleDto dto)
        {
            // 1. Buscar Cliente pelo CPF
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Cpf == dto.CpfCliente);
            if (client == null) return NotFound("Cliente não encontrado com este CPF.");

            // 2. Buscar Produto pelo Código
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductCode == dto.CodigoProduto);
            if (product == null) return NotFound("Produto não encontrado.");

            // 3. Validar Estoque
            if (product.StockQuantity <= 0) return BadRequest("Produto sem estoque.");

            // 4. Criar a Venda
            var sale = new Sale
            {
                ClientId = client.Id,
                ProductId = product.Id,
                TotalValue = dto.ValorTotal,
                SaleDate = DateTime.UtcNow
            };

            // Iniciar transação para garantir que Venda e OS sejam criadas juntas
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Salvar Venda e Atualizar Estoque
                product.StockQuantity -= 1;
                _context.Sales.Add(sale);
                await _context.SaveChangesAsync(); // Gera o ID da Venda

                // 5. GERAR ORDEM DE SERVIÇO AUTOMATICAMENTE
                var serviceOrder = new ServiceOrder
                {
                    Type = ServiceOrderType.Venda,
                    Status = "Aguardando Laboratório", // Status inicial padrão
                    SaleId = sale.Id,
                    ClientId = sale.ClientId,
                    CreatedDate = DateTime.UtcNow
                };

                _context.ServiceOrders.Add(serviceOrder);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { Message = "Venda realizada e Ordem de Serviço gerada.", SaleId = sale.Id, ServiceOrderId = serviceOrder.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Erro ao processar venda: " + ex.Message);
            }
        }

        // Endpoint para buscar cliente pelo CPF (usado na tela de venda antes de salvar)
        [HttpGet("cliente/{cpf}")]
        public async Task<IActionResult> GetClientByCpf(string cpf)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Cpf == cpf);
            if (client == null) return NotFound("Cliente não encontrado.");
            return Ok(client);
        }
        
        // Endpoint para buscar produto pelo Código
        [HttpGet("produto/{codigo}")]
        public async Task<IActionResult> GetProductByCode(string codigo)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductCode == codigo);
            if (product == null) return NotFound("Produto não encontrado.");
            return Ok(product);
        }
    }
}