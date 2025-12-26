using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OticaERP.API.Models
{
    public class SaleItem
    {
        [Key]
        public int Id { get; set; }

        public int SaleId { get; set; }
        [ForeignKey("SaleId")]
        public Sale? Sale { get; set; }

        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; } // Preço no momento da venda

        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; } // Quantidade * Preço
    }
}