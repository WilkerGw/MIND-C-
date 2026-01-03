namespace OticaERP.API.DTOs
{
    public class DashboardStatsDto
    {
        public decimal DailySalesTotal { get; set; }
        public decimal DailySalesPreviousYear { get; set; } // Mesmo dia ano passado
        public decimal MonthlySalesTotal { get; set; }
        public int ActiveServiceOrdersCount { get; set; }
    }

    public class SalesHistoryDto
    {
        public string Period { get; set; } // "MM/yyyy"
        public decimal TotalValue { get; set; }
    }
}
