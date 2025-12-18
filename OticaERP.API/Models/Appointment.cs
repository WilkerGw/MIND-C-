using System.ComponentModel.DataAnnotations;

namespace OticaERP.API.Models
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        public int ClientId { get; set; }
        public Client? Client { get; set; }

        public DateTime AppointmentDate { get; set; }

        public string? Notes { get; set; }
    }
}
