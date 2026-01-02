using System.ComponentModel.DataAnnotations;

namespace OticaERP.API.Models
{
    public class Sale
    {
        [Key]
        public int Id { get; set; }

        public int ClientId { get; set; }
        public Client? Client { get; set; }

        public DateTime SaleDate { get; set; } = DateTime.UtcNow;

        public decimal TotalValue { get; set; }
        public decimal EntryValue { get; set; }

        // REMOVIDO: Quantity e ProductId direto na venda
        // ADICIONADO: Lista de itens
        public List<SaleItem> Items { get; set; } = new List<SaleItem>();

        public int? ServiceOrderId { get; set; }
        public ServiceOrder? ServiceOrder { get; set; }
    }
}