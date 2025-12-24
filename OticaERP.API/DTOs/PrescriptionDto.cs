namespace OticaERP.API.DTOs
{
    public class PrescriptionDto
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public DateTime ExamDate { get; set; }

        // Dados do Olho Direito (OD)
        public string OdEsferico { get; set; } = string.Empty;
        public string OdCilindrico { get; set; } = string.Empty;
        public int OdEixo { get; set; }

        // Dados do Olho Esquerdo (OE)
        public string OeEsferico { get; set; } = string.Empty;
        public string OeCilindrico { get; set; } = string.Empty;
        public int OeEixo { get; set; }

        // Adicionais
        public string Dnp { get; set; } = string.Empty;
        public string Adicao { get; set; } = string.Empty;
        public string Altura { get; set; } = string.Empty;
        public string Observation { get; set; } = string.Empty;
    }

    public class CreatePrescriptionDto
    {
        public int ClientId { get; set; }
        public DateTime ExamDate { get; set; }

        public string OdEsferico { get; set; } = string.Empty;
        public string OdCilindrico { get; set; } = string.Empty;
        public int OdEixo { get; set; }

        public string OeEsferico { get; set; } = string.Empty;
        public string OeCilindrico { get; set; } = string.Empty;
        public int OeEixo { get; set; }

        public string Dnp { get; set; } = string.Empty;
        public string Adicao { get; set; } = string.Empty;
        public string Altura { get; set; } = string.Empty;
        public string Observation { get; set; } = string.Empty;
    }
}