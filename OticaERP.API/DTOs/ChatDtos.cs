namespace OticaERP.API.DTOs;

public class ChatMessageRequest
{
    public string Message { get; set; } = string.Empty;
    public string? UserId { get; set; }
}

public class ChatMessageResponse
{
    public string Response { get; set; } = string.Empty;
}
