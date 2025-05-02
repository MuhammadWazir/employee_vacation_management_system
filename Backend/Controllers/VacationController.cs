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
            // O(1) - claim lookup
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // O(n) - query building (where n = total vacations for user)
            var query = _context.Vacations
                .Where(v => v.UserId == userId)
                .OrderByDescending(v => v.From);

            // O(n) - count operation
            var total = await query.CountAsync();
            
            // O(m) - paginated query (where m = pageSize)
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
            // O(1) - claim lookup
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // O(1) - indexed lookup by id + user filter
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
            // O(1) - date comparison
            if (!request.IsValidPeriod())
                return BadRequest("End date must be after start date.");

            // O(1) - claim lookup
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // O(1) - user lookup by id
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            // O(1) - object creation
            var vacation = new Vacation
            {
                Description = request.Description,
                From = request.From,
                To = request.To,
                UserId = userId,
                User = user
            };

            // O(1) - add operation
            _context.Vacations.Add(vacation);
            
            // O(1) - save operation (assuming single record)
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
            // O(1) - date comparison
            if (!request.IsValidPeriod())
                return BadRequest("End date must be after start date.");

            // O(1) - claim lookup
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // O(1) - indexed lookup by id + user filter
            var vacation = await _context.Vacations
                .FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId);

            if (vacation == null)
                return NotFound();

            // O(1) - property updates
            vacation.Description = request.Description;
            vacation.From = request.From;
            vacation.To = request.To;
            vacation.Duration = (request.To - request.From).Days + 1;

            // O(1) - save operation
            await _context.SaveChangesAsync();

            return Ok();
        }

        // DELETE: api/Vacation/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVacation(int id)
        {
            // O(1) - claim lookup
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // O(1) - indexed lookup by id + user filter
            var vacation = await _context.Vacations
                .FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId);

            if (vacation == null)
                return NotFound();

            // O(1) - remove operation
            _context.Vacations.Remove(vacation);
            
            // O(1) - save operation
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}