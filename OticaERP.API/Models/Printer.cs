using System.ComponentModel.DataAnnotations;

namespace OticaERP.API.Models
{
    public class Printer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty; // Ex: Elgin Balcão

        public string Model { get; set; } = string.Empty; // Ex: Elgin i9

        public string SerialNumber { get; set; } = string.Empty;

        // "Thermal", "A4"
        public string Type { get; set; } = "Thermal"; 

        [Required]
        public string ConnectionPath { get; set; } = string.Empty; // Ex: \\PC-CAIXA\Elgin ou 192.168.1.100

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
