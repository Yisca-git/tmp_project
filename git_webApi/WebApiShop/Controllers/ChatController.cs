using Microsoft.AspNetCore.Mvc;
using Services;
using System.Text;
using System.Text.Json;

namespace EventDressRental.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IModelService _modelService;
        private readonly IDressService _dressService;
        private readonly HttpClient _httpClient;

        public ChatController(IModelService modelService, IDressService dressService, IHttpClientFactory httpClientFactory)
        {
            _modelService = modelService;
            _dressService = dressService;
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost]
        public async Task<ActionResult<ChatReplyDTO>> Chat([FromBody] ChatRequestDTO request)
        {
            var result = await _modelService.GetModelds(null, null, null, Array.Empty<int>(), null, 1, 100);
            var dresses = new List<object>();
            foreach (var m in result.Items)
            {
                var dressList = await _dressService.GetDressesByModelId(m.Id);
                dresses.Add(new
                {
                    m.Name, m.Description, m.Color, m.BasePrice,
                    Categories = m.Categories.Select(c => c.Name),
                    Sizes = dressList.Select(d => new { d.Size, d.Price, d.Note })
                });
            }

            var payload = new { message = request.Message, dresses };
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("http://localhost:8000/chat", content);
            var body = await response.Content.ReadAsStringAsync();
            var reply = JsonSerializer.Deserialize<ChatReplyDTO>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return Ok(reply);
        }
    }

    public record ChatRequestDTO(string Message);
    public record ChatReplyDTO(string Reply);
}
