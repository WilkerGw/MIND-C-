namespace OticaERP.API.DTOs
{
    public class ServiceOrderDto
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ServiceType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime DeliveryDate { get; set; }
    }

    public class CreateServiceOrderDto
    {
        public int ClientId { get; set; }
        public int ProductId { get; set; }
        public string ServiceType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateTime DeliveryDate { get; set; }
    }

    public class UpdateServiceOrderStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}