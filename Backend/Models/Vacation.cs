using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Backend.Models
{
    public class Vacation
    {
    [Key]
    public int Id { get; set; }

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime From { get; set; }

    [Required]
    public DateTime To { get; set; }

    [Required]
    public int Duration { get; set; } // in days

    // Foreign key
    [ForeignKey("User")]
    public string UserId { get; set; }= string.Empty;

    // Navigation property
    public required User User { get; set; }
    public Vacation() { }
   public Vacation(string description, DateTime from, DateTime to, string userId)
    {
        Description = description;
        From = from;
        To = to;
        UserId = userId;
        Duration = (to - from).Days + 1;
    }

        // Method to update dates and recalculate duration
        public void UpdateDates(DateTime newFrom, DateTime newTo)
        {
            From = newFrom;
            To = newTo;
            CalculateDuration();
        }

        private void CalculateDuration()
        {
            if (To < From)
                throw new InvalidOperationException("End date cannot be before start date");
                
            Duration = (To - From).Days + 1; // Inclusive count
        }
    }
}