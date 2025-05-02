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
            // O(n) - where n is number of users (database query)
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // find user by username - O(n)
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.UserName == loginDto.Username.ToLower());

            if (user == null) return Unauthorized("Invalid username!");

            // check password - O(1)
            var result = await _signinManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded) return Unauthorized("Username not found and/or password incorrect");

            // create token - O(1) assuming constant time operations
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
                // O(1) - model validation
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // create new user - O(1)
                var User = new User
                {
                    UserName = registerDto.Username,
                    Email = registerDto.Email,
                    Vacations = new List<Vacation>()
                };

                // create user in db - O(1) for hash operations
                var createdUser = await _userManager.CreateAsync(User, registerDto.Password);

                if (createdUser.Succeeded)
                {
                    // add role - O(1)
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
        [Authorize]
        public async Task<IActionResult> UpdateAccount(UpdateAccountDto updateDto)
        {
            // O(1) - model validation
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // get user id from token - O(1)
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // find user - O(1) with indexed lookup
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            // update email if changed - O(1)
            if (!string.IsNullOrEmpty(updateDto.Email) && user.Email != updateDto.Email)
            {
                user.Email = updateDto.Email;
                var emailResult = await _userManager.SetEmailAsync(user, updateDto.Email);
                if (!emailResult.Succeeded)
                    return BadRequest(emailResult.Errors);
            }

            // update username if changed - O(1)
            if (!string.IsNullOrEmpty(updateDto.Username) && user.UserName != updateDto.Username)
            {
                user.UserName = updateDto.Username;
                var usernameResult = await _userManager.SetUserNameAsync(user, updateDto.Username);
                if (!usernameResult.Succeeded)
                    return BadRequest(usernameResult.Errors);
            }

            // update password if provided - O(1) for hash operations
            if (!string.IsNullOrEmpty(updateDto.CurrentPassword) && !string.IsNullOrEmpty(updateDto.NewPassword))
            {
                var passwordResult = await _userManager.ChangePasswordAsync(user, updateDto.CurrentPassword, updateDto.NewPassword);
                if (!passwordResult.Succeeded)
                    return BadRequest(passwordResult.Errors);
            }

            // save changes - O(1)
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
        [Authorize]
        public async Task<IActionResult> DeleteAccount(DeleteAccountDto deleteDto)
        {
            // O(1) - model validation
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // get user id from token - O(1)
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // find user - O(1) with indexed lookup
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            // verify password - O(1)
            var passwordValid = await _userManager.CheckPasswordAsync(user, deleteDto.Password);
            if (!passwordValid)
                return Unauthorized("Invalid password.");

            // delete user - O(1)
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return NoContent();
        }
    }
}