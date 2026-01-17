namespace OticaERP.API.DTOs
{
    public class PrinterDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public string Type { get; set; } = "Thermal";
        public string ConnectionPath { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
