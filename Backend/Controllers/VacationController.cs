using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Backend.Models;
using Backend.DTOs.VacationDtos;
using Backend.Data;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VacationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VacationController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Vacation
        [HttpGet]
        public async Task<IActionResult> GetVacations(int page = 1, int pageSize = 10)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var query = _context.Vacations
                .Where(v => v.UserId == userId)
                .OrderByDescending(v => v.From);

            var total = await query.CountAsync();
            var vacations = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new VacationResponseDto
                {
                    Id = v.Id,
                    Description = v.Description,
                    From = v.From,
                    To = v.To,
                    Duration = v.Duration,
                    UserId = v.UserId
                })
                .ToListAsync();

            return Ok(new
            {
                Total = total,
                Page = page,
                PageSize = pageSize,
                Items = vacations
            });
        }

        // GET: api/Vacation/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetVacation(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var vacation = await _context.Vacations
                .Where(v => v.Id == id && v.UserId == userId)
                .Select(v => new VacationResponseDto
                {
                    Id = v.Id,
                    Description = v.Description,
                    From = v.From,
                    To = v.To,
                    Duration = v.Duration,
                    UserId = v.UserId
                })
                .FirstOrDefaultAsync();

            if (vacation == null)
                return NotFound();

            return Ok(vacation);
        }

        // POST: api/Vacation
        [HttpPost]
        public async Task<IActionResult> CreateVacation(VacationRequestDto request)
        {
            if (!request.IsValidPeriod())
                return BadRequest("End date must be after start date.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            var vacation = new Vacation
            {
                Description = request.Description,
                From = request.From,
                To = request.To,
                UserId = userId,
                User = user
            };

            _context.Vacations.Add(vacation);
            await _context.SaveChangesAsync();

            var response = new VacationResponseDto
            {
                Id = vacation.Id,
                Description = vacation.Description,
                From = vacation.From,
                To = vacation.To,
                Duration = vacation.Duration,
                UserId = vacation.UserId
            };

            return CreatedAtAction(nameof(GetVacation), new { id = vacation.Id }, response);
        }

        // PUT: api/Vacation/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVacation(int id, VacationRequestDto request)
        {
            if (!request.IsValidPeriod())
                return BadRequest("End date must be after start date.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var vacation = await _context.Vacations
                .FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId);

            if (vacation == null)
                return NotFound();

            vacation.Description = request.Description;
            vacation.From = request.From;
            vacation.To = request.To;
            vacation.Duration = (request.To - request.From).Days + 1;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Vacation/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVacation(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var vacation = await _context.Vacations
                .FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId);

            if (vacation == null)
                return NotFound();

            _context.Vacations.Remove(vacation);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
