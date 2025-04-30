using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.VacationDtos
{
    public class VacationRequestDto
    {
        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime From { get; set; }

        [Required]
        public DateTime To { get; set; }

        // Validation method
        public bool IsValidPeriod() => To >= From;
    }
}