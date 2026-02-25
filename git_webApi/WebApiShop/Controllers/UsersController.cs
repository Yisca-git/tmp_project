using Entities;
using DTOs;
using Microsoft.AspNetCore.Mvc;
using Repositories;
using Services;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization; 

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EventDressRental.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IUserPasswordService _userPasswordService;
        private readonly ILogger<UsersController> _logger;
        private readonly ITokenService _tokenService; 

        public UsersController(IUserService userService, IUserPasswordService userPasswordService, ILogger<UsersController> logger, ITokenService tokenService  )
        {
            _logger = logger;
            _userService = userService;
            _userPasswordService = userPasswordService;
            _tokenService = tokenService;
        }

        // GET: api/<UsersController>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> Get()
        {
            List<UserDTO> users = await _userService.GetUsers();
            if(users.Count()==0)
                return NoContent();
            return Ok(users);
        }

        // GET api/<UsersController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUserId(int id)
        {
            UserDTO user = await _userService.GetUserById(id);
            return user != null ? Ok(user) : NotFound();
        }

        // POST api/<UsersController>
        [HttpPost]
        public async Task<ActionResult<AuthenticatedUser>> AddUser([FromBody] UserRegisterDTO newUser)
        {
            int passwordScore = _userPasswordService.CheckPassword(newUser.Password);
            if(passwordScore < 2)
                return BadRequest("Password is not strong enough");
            AuthenticatedUser user = await _userService.AddUser(newUser);
            return CreatedAtAction(nameof(GetUserId), new { Id = user.User.Id }, user);
        }
        // POST api/<UsersController>
        [HttpPost("login")]
        public async Task<ActionResult<AuthenticatedUser>> LogIn([FromBody] UserLoginDTO existingUser)
        {
            AuthenticatedUser user = await _userService.LogIn(existingUser);
            if(user == null)
                return Unauthorized("user name or password are wrong");
            _logger.LogInformation($"login {user.User.FirstName} , {user.User.Password} !");
            return Ok(user);
        }
        // PUT api/<UsersController>/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] UserDTO updateUser)
        {
            if (await _userService.IsExistsUserById(id) == false)
                return NotFound(id);
            int passwordScore = _userPasswordService.CheckPassword(updateUser.Password);
            if (passwordScore < 2)
                return BadRequest("Password is not strong enough");
            await _userService.UpdateUser(id, updateUser);
            return Ok();
        }

        // PUT api/users/5/role
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDTO roleUpdate)
        {
            if (await _userService.IsExistsUserById(id) == false)
                return NotFound(id);
            
            if (roleUpdate.Role != "Admin" && roleUpdate.Role != "User")
                return BadRequest("Invalid role. Must be 'Admin' or 'User'");

            UserDTO currentUser = await _userService.GetUserById(id);
            
            if (currentUser.Role == "Admin" && roleUpdate.Role == "User")
                return BadRequest("Cannot demote an Admin to User");
            
            if (currentUser.Role == "User" && roleUpdate.Role == "Admin")
            {
                await _userService.UpdateUserRole(id, roleUpdate.Role);
                return Ok();
            }

            return BadRequest("No role change needed or invalid operation");
        }
    }
}
