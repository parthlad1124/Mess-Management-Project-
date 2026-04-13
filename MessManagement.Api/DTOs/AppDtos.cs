namespace MessManagement.Api.DTOs
{
    public class MenuDto
    {
        public required string DayOfWeek { get; set; }
        public required string Breakfast { get; set; }
        public required string Lunch { get; set; }
        public required string Dinner { get; set; }
    }

    public class AttendanceDto
    {
        public int UserId { get; set; }
        public required DateTime Date { get; set; }
        public required string MealType { get; set; }
        public required string Status { get; set; }
    }

    public class PaymentDto
    {
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public required string Status { get; set; }
        public required string InvoiceMonth { get; set; }
        public DateTime? DatePaid { get; set; }
    }

    public class FeedbackDto
    {
        public required string Category { get; set; }
        public required string Message { get; set; }
    }

    public class LeaveDto
    {
        public int UserId { get; set; }
        public required DateTime StartDate { get; set; }
        public required DateTime EndDate { get; set; }
        public bool BreakfastLeave { get; set; }
        public bool LunchLeave { get; set; }
        public bool DinnerLeave { get; set; }
        public required string Reason { get; set; }
        public string Status { get; set; } = "Pending";
    }

    public class InventoryItemDto
{
    public required string ItemName { get; set; }
    public required string Category { get; set; }
    public decimal Quantity { get; set; }
    public required string Unit { get; set; }
    public decimal MinStockLevel { get; set; }
}
}
