using System.ComponentModel.DataAnnotations;

namespace OticaERP.API.DTOs
{
    // O que recebemos da tela para criar a venda
    public class CreateSaleDto
    {
        public string CpfCliente { get; set; } = string.Empty;
        
        // Lista de produtos no carrinho
        public List<SaleItemDto> Items { get; set; } = new List<SaleItemDto>();

        public decimal EntryValue { get; set; }
        public decimal? FinalPrice { get; set; } // Valor final editável
        public DateTime? SaleDate { get; set; }
        public int? CustomOsNumber { get; set; }
    }
}
