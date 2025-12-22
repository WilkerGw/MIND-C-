using System.ComponentModel.DataAnnotations;

namespace OticaERP.API.Models
{
    public class ServiceOrder
    {
        [Key]
        public int Id { get; set; }

        // Relacionamento com Cliente
        public int ClientId { get; set; }
        public Client? Client { get; set; }

        // Relacionamento com Produto (Novo)
        public int ProductId { get; set; }
        public Product? Product { get; set; }

        // Detalhes do Serviço
        public ServiceOrderType ServiceType { get; set; } // Renomeado para evitar conflito com palavras reservadas
        
        public string Description { get; set; } = string.Empty; // Novo campo
        
        public decimal Price { get; set; } // Padronizado como Price (antes era EstimatedValue)

        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Padronizado como CreatedAt
        
        public DateTime DeliveryDate { get; set; } // Novo campo

        // Campos opcionais mantidos (caso use futuramente para lógica de Vendas/Consultas)
        public int? SaleId { get; set; }
        public Sale? Sale { get; set; }
        
        public string? ExamResult { get; set; }
        
        public int? AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }
    }
}