namespace MessManagement.Api.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public required string Status { get; set; } // Paid, Pending
        public required string InvoiceMonth { get; set; } // e.g. "March 2026"
        public DateTime? DatePaid { get; set; }

        public User? User { get; set; }
    }
}
