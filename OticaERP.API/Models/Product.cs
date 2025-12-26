using System.ComponentModel.DataAnnotations;

namespace OticaERP.API.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        // REMOVIDO: public string? Description { get; set; }

        public string ProductCode { get; set; } = string.Empty;

        // MUDANÇA: Alterado de int para string para aceitar "Armação", "Lentes", etc.
        public string Category { get; set; } = string.Empty; 

        [Range(0, double.MaxValue)]
        public decimal CostPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal SellingPrice { get; set; }

        public int StockQuantity { get; set; }
    }
}