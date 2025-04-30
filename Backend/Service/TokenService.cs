using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Service
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _key;

        public TokenService(IConfiguration config)
        {
            _config = config;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:SigningKey"]));
        }

        public string CreateToken(User user)
        {
            try
            {
                // Ensure we have a valid signing key
                if (_key.KeySize < 128)
                {
                    throw new ArgumentException("Signing key must be at least 128 bits");
                }

                var claims = new List<Claim>
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id), // Standard "sub" claim for user ID
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.GivenName, user.UserName),
                    new Claim(ClaimTypes.NameIdentifier, user.Id) // Adding this as well for backward compatibility
                };

                var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256); // Using Sha256 which is more widely supported

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddDays(7), // Use UTC for consistency
                    SigningCredentials = creds,
                    Issuer = _config["JWT:Issuer"],
                    Audience = _config["JWT:Audience"]
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);
                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error creating token: {ex.Message}");
                throw;
            }
        }
    }
}