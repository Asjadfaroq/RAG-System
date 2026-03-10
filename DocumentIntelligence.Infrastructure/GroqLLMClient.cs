using System.Text;
using System.Text.Json;
using DocumentIntelligence.Application;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DocumentIntelligence.Infrastructure;

/// <summary>
/// Groq LLM client using the OpenAI-compatible chat completions API.
/// Uses models such as llama-3.3-70b-versatile or mixtral-8x7b.
/// </summary>
public class GroqLLMClient : ILLMClient
{
    private const string DefaultBaseUrl = "https://api.groq.com/openai/v1";
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GroqLLMClient> _logger;

    public GroqLLMClient(HttpClient httpClient, IConfiguration configuration, ILogger<GroqLLMClient> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>Strips control characters (e.g. \r from Windows .env) for safe use in headers/URLs.</summary>
    private static string SanitizeConfig(string? value) =>
        string.IsNullOrEmpty(value) ? value ?? string.Empty : string.Concat(value.Trim().Where(c => !char.IsControl(c)));

    public async Task<string> GenerateAnswerAsync(string question, string context, string? languageHint, CancellationToken cancellationToken)
    {
        var apiKey = SanitizeConfig(_configuration["GROQ_API_KEY"]);
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("GROQ_API_KEY is not configured.");

        var model = SanitizeConfig(_configuration["GROQ_MODEL"])?.Trim();
        if (string.IsNullOrWhiteSpace(model))
            model = "llama-3.3-70b-versatile";

        var languageInstruction = string.IsNullOrWhiteSpace(languageHint)
            ? ""
            : languageHint.Trim().Equals("ar", StringComparison.OrdinalIgnoreCase)
                ? " Answer in Arabic only."
                : " Answer in English only.";

        var systemContent = "You are a precise document Q&A assistant. Answer ONLY using the provided context.\n\n" +
            "CRITICAL: Base your answer strictly on the context below. Do not infer, assume, or fabricate. " +
            "If the information is NOT in the context, say you could not find it. Never state that something is absent; " +
            "only say you could not find it in the given context.\n\n" +
            "For lists (companies, roles, dates): include ALL matches found in the context. Do not omit any entity.\n" +
            "For yes/no questions: answer only Yes or No based on explicit evidence in the context." +
            languageInstruction;

        var userContent = $"Context:\n{context}\n\nQuestion: {question}\n\nAnswer:";

        var payload = new
        {
            model,
            messages = new[]
            {
                new { role = "system", content = systemContent },
                new { role = "user", content = userContent }
            },
            max_tokens = 512,
            temperature = 0.2
        };

        var baseUrl = SanitizeConfig(_configuration["GROQ_BASE_URL"]);
        if (string.IsNullOrWhiteSpace(baseUrl))
            baseUrl = DefaultBaseUrl;

        var url = baseUrl.TrimEnd('/') + "/chat/completions";

        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
        request.Content = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json");

        _logger.LogDebug("Groq LLM request: model={Model}", model);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        var json = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Groq LLM error: Status={StatusCode} Body={Body}", response.StatusCode, json);
            throw new InvalidOperationException($"Groq LLM error ({response.StatusCode}): {json}");
        }

        using var doc = JsonDocument.Parse(json);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString()?.Trim() ?? string.Empty;

        _logger.LogDebug("Groq LLM response received, length={Length}", content.Length);
        return content;
    }
}
