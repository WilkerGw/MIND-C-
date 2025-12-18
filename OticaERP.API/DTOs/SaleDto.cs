namespace OticaERP.API.DTOs
{
    // O que o Frontend envia para salvar uma venda
    public record SaleDto(string CpfCliente, string CodigoProduto, decimal ValorTotal);
}