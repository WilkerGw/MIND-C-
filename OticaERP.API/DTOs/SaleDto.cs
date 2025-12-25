namespace OticaERP.API.DTOs
{
    public class SaleDto
    {
        public int Id { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal TotalValue { get; set; }
        public decimal EntryValue { get; set; } // Exibe na consulta
        public DateTime SaleDate { get; set; }
    }

    public class CreateSaleDto
    {
        public string CpfCliente { get; set; } = string.Empty;
        public string CodigoProduto { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal ValorTotal { get; set; }
        public decimal EntryValue { get; set; } // Recebe no cadastro
        
        public DateTime? SaleDate { get; set; } // Permite informar data retroativa

        // --- NOVO CAMPO ---
        public int? CustomOsNumber { get; set; } // Número manual da OS (Opcional)
    }
}