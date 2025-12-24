namespace OticaERP.API.DTOs
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string Observation { get; set; } = string.Empty;
        public string Status { get; set; } = "Agendado";
    }

    public class CreateAppointmentDto
    {
        public int ClientId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Observation { get; set; } = string.Empty;
    }
}