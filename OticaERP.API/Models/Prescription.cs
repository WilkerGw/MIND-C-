using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OticaERP.API.Models
{
    public class Prescription
    {
        [Key]
        public int Id { get; set; }

        public int ClientId { get; set; }
        public Client? Client { get; set; }

        public DateTime ExamDate { get; set; }

        // --- MUDANÇA: Usamos string para flexibilidade visual (+, -, PLANO) ---
        
        // Olho Direito
        public string OdEsferico { get; set; } = string.Empty;
        public string OdCilindrico { get; set; } = string.Empty;
        public int OdEixo { get; set; } // Eixo continua sendo número inteiro (0 a 180)

        // Olho Esquerdo
        public string OeEsferico { get; set; } = string.Empty;
        public string OeCilindrico { get; set; } = string.Empty;
        public int OeEixo { get; set; }

        // Medidas Adicionais
        public string Dnp { get; set; } = string.Empty;
        public string Adicao { get; set; } = string.Empty;
        public string Altura { get; set; } = string.Empty;

        public string Observation { get; set; } = string.Empty;
    }
}