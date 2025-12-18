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

        public string? Description { get; set; }

        public string ProductCode { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public int StockQuantity { get; set; }
    }
}
