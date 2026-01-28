using Microsoft.AspNetCore.Mvc;
using OticaERP.API.DTOs;
using System.Text;
using System.Text.Json;

namespace OticaERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIChatController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<AIChatController> _logger;

    public AIChatController(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<AIChatController> logger)
    {
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] ChatMessageRequest request)
    {
        try
        {
            var webhookUrl = _configuration["N8N:WebhookUrl"];
            if (string.IsNullOrEmpty(webhookUrl))
            {
                // Fallback for demo purposes if not configured
                return Ok(new ChatMessageResponse { Response = "Erro: URL do N8N não configurada no Backend." });
            }

            // Prepare payload for N8N
            var payload = new
            {
                message = request.Message,
                userId = request.UserId ?? "anonymous",
                sessionId = request.UserId ?? "anonymous",
                timestamp = DateTime.UtcNow
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            // You might want to add authentication here if your N8N webhook is protected
            // var apiKey = _configuration["N8N:ApiKey"];
            // if (!string.IsNullOrEmpty(apiKey)) _httpClient.DefaultRequestHeaders.Add("X-N8N-API-KEY", apiKey);

            var response = await _httpClient.PostAsync(webhookUrl, content);

            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();
                
                // N8N should return a JSON with { "response": "..." } or similar
                // We assume N8N returns the exact JSON structure we need or we map it here
                _logger.LogInformation($"N8N Response: {responseString}");
                
                try 
                {
                     // Try to parse N8N response directly
                     var chatResponse = JsonSerializer.Deserialize<ChatMessageResponse>(responseString, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                     return Ok(chatResponse);
                }
                catch
                {
                    // If N8N returns just text or different structure, wrap it
                    return Ok(new ChatMessageResponse { Response = responseString });
                }
            }
            else
            {
                _logger.LogError($"N8N Error: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}");
                return StatusCode((int)response.StatusCode, "Erro ao processar mensagem na IA.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat message");
            return StatusCode(500, "Erro interno no servidor.");
        }
    }
}
