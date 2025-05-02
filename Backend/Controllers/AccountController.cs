using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Dtos.Account;
using Backend.Models;
using Backend.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Route("Backend/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;
        private readonly SignInManager<User> _signinManager;
        public AccountController(UserManager<User> userManager, ITokenService tokenService, SignInManager<User> signInManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signinManager = signInManager;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.UserName == loginDto.Username.ToLower());

            if (user == null) return Unauthorized("Invalid username!");

            var result = await _signinManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded) return Unauthorized("Username not found and/or password incorrect");

            return Ok(
                new NewUserDto
                {
                    UserName = user.UserName,
                    Email = user.Email,
                    Token = _tokenService.CreateToken(user)
                }
            );
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var User = new User
                {
                    UserName = registerDto.Username,
                    Email = registerDto.Email,
                    Vacations = new List<Vacation>()
                };

                var createdUser = await _userManager.CreateAsync(User, registerDto.Password);

                if (createdUser.Succeeded)
                {
                    var roleResult = await _userManager.AddToRoleAsync(User, "User");
                    if (roleResult.Succeeded)
                    {
                        return Ok(
                            new NewUserDto
                            {
                                UserName = User.UserName,
                                Email = User.Email,
                                Token = _tokenService.CreateToken(User)
                            }
                        );
                    }
                    else
                    {
                        return StatusCode(500, roleResult.Errors);
                    }
                }
                else
                {
                    return StatusCode(500, createdUser.Errors);
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, e);
            }
        }

        [HttpPut("update")]
[Authorize] // Require authentication
public async Task<IActionResult> UpdateAccount(UpdateAccountDto updateDto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId))
        return Unauthorized();

    var user = await _userManager.FindByIdAsync(userId);
    if (user == null)
        return NotFound("User not found.");

    // Update email if provided and different
    if (!string.IsNullOrEmpty(updateDto.Email) && user.Email != updateDto.Email)
    {
        user.Email = updateDto.Email;
        var emailResult = await _userManager.SetEmailAsync(user, updateDto.Email);
        if (!emailResult.Succeeded)
            return BadRequest(emailResult.Errors);
    }

    // Update username if provided and different
    if (!string.IsNullOrEmpty(updateDto.Username) && user.UserName != updateDto.Username)
    {
        user.UserName = updateDto.Username;
        var usernameResult = await _userManager.SetUserNameAsync(user, updateDto.Username);
        if (!usernameResult.Succeeded)
            return BadRequest(usernameResult.Errors);
    }

    // Update password if provided
    if (!string.IsNullOrEmpty(updateDto.CurrentPassword) && !string.IsNullOrEmpty(updateDto.NewPassword))
    {
        var passwordResult = await _userManager.ChangePasswordAsync(user, updateDto.CurrentPassword, updateDto.NewPassword);
        if (!passwordResult.Succeeded)
            return BadRequest(passwordResult.Errors);
    }

    var result = await _userManager.UpdateAsync(user);
    if (!result.Succeeded)
        return BadRequest(result.Errors);

    return Ok(new NewUserDto
    {
        UserName = user.UserName,
        Email = user.Email,
        Token = _tokenService.CreateToken(user)
    });
}

[HttpDelete("delete")]
[Authorize] // Require authentication
public async Task<IActionResult> DeleteAccount(DeleteAccountDto deleteDto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId))
        return Unauthorized();

    var user = await _userManager.FindByIdAsync(userId);
    if (user == null)
        return NotFound("User not found.");

    // Verify password before deletion
    var passwordValid = await _userManager.CheckPasswordAsync(user, deleteDto.Password);
    if (!passwordValid)
        return Unauthorized("Invalid password.");

    var result = await _userManager.DeleteAsync(user);
    if (!result.Succeeded)
        return BadRequest(result.Errors);

    return NoContent();
}
        
    }
}