using System.ComponentModel.DataAnnotations;

namespace OticaERP.API.Models
{
    public class ServiceOrder
    {
        [Key]
        public int Id { get; set; }

        public int ClientId { get; set; }
        public Client? Client { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Pending";

        public ServiceOrderType Type { get; set; }

        public int? SaleId { get; set; }
        public Sale? Sale { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? ExamResult { get; set; }

        public int? AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }

        public decimal EstimatedValue { get; set; }
    }
}
