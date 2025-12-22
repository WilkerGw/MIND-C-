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
        
        // Novo Campo
        public int Quantity { get; set; }

        public int ProductId { get; set; }
        public Product? Product { get; set; }

        public int? ServiceOrderId { get; set; }
    }
}