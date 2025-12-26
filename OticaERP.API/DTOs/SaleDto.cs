using System.ComponentModel.DataAnnotations;

namespace OticaERP.API.DTOs
{
    // O que retornamos para a tela (Lista de vendas)
    public class SaleDto
    {
        public int Id { get; set; }
        public string ClientName { get; set; } = string.Empty;
        // Agora mostramos um resumo dos produtos (ex: "Lente, Armação...")
        public string ProductsSummary { get; set; } = string.Empty; 
        public decimal TotalValue { get; set; }
        public decimal EntryValue { get; set; }
        public DateTime SaleDate { get; set; }
    }

    // Item individual do Carrinho (usado apenas na criação)
    public class SaleItemDto
    {
        public string ProductCode { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }

    // O que recebemos da tela para criar a venda
    public class CreateSaleDto
    {
        public string CpfCliente { get; set; } = string.Empty;
        
        // Lista de produtos no carrinho
        public List<SaleItemDto> Items { get; set; } = new List<SaleItemDto>();

        public decimal EntryValue { get; set; }
        public DateTime? SaleDate { get; set; }
        public int? CustomOsNumber { get; set; }
    }
}