using System;

namespace Backend.DTOs.VacationDtos
{
    public class VacationResponseDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public int Duration { get; set; }
        public string UserId { get; set; }= string.Empty; // Only ID, not full employee object
    }
}