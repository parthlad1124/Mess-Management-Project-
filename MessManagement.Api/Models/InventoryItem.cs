namespace MessManagement.Api.Models
{
    public class InventoryItem
    {
        public int Id { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal MinStockLevel { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}