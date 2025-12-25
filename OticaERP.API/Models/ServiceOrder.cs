using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OticaERP.API.Models
{
    public class ServiceOrder
    {
        [Key]
        public int Id { get; set; }

        // Campo para o número manual (obrigatório na regra de negócio agora)
        public int? ManualOrderNumber { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeliveryDate { get; set; }

        [StringLength(50)]
        public string Status { get; set; } = "Aguardando Coleta";

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        // O Tipo agora é referenciado corretamente do arquivo ServiceOrderType.cs
        public ServiceOrderType ServiceType { get; set; }

        public int ClientId { get; set; }
        public Client? Client { get; set; }

        public int? ProductId { get; set; }
        public Product? Product { get; set; }

        public int SaleId { get; set; }
        public Sale? Sale { get; set; }

        public int? AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }
    }
}