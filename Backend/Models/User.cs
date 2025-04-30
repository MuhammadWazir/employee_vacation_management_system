using System;
using Microsoft.AspNetCore.Identity;
namespace Backend.Models
{
    public class User: IdentityUser
    {
    // Navigation property
    public required ICollection<Vacation> Vacations { get; set; }
    }
}