namespace OticaERP.API.DTOs
{
    public class ServiceOrderDto
    {
        public int Id { get; set; }
        public int? ManualOrderNumber { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public string Status { get; set; } = string.Empty;
        
        public string ClientName { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ServiceType { get; set; } = string.Empty;

        // --- CAMPOS FINANCEIROS ---
        public decimal TotalValue { get; set; }       // Valor total da venda
        public decimal EntryValue { get; set; }       // Valor que já foi pago na entrada
        public decimal RemainingBalance { get; set; } // O que falta pagar (Saldo Devedor)
    }

    public class UpdateServiceOrderDto
    {
        public string Status { get; set; } = string.Empty;
        public DateTime? DeliveryDate { get; set; }
    }
}