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
        public int? ManualOsNumber { get; set; }
        public DateTime SaleDate { get; set; }
    }

    // Item individual do Carrinho (usado apenas na criação)
    public class SaleItemDto
    {
        public string ProductCode { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }

}
