namespace OticaERP.API.DTOs
{
    public class ServiceOrderDto
    {
        public int Id { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string ServiceType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        
        // --- VALORES FINANCEIROS ---
        public decimal TotalValue { get; set; }  // Valor Total da Venda
        public decimal EntryValue { get; set; }  // Valor que o cliente já pagou
        public decimal RemainingValue { get; set; } // O que falta pagar
        // ---------------------------

        public DateTime CreatedAt { get; set; }
        public DateTime DeliveryDate { get; set; }
    }

    public class CreateServiceOrderDto
    {
        public string ServiceType { get; set; } = "Manutenção";
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int ClientId { get; set; }
        public int ProductId { get; set; }
        public DateTime DeliveryDate { get; set; }
    }
    
    public class UpdateServiceOrderStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}