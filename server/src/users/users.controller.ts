import { Body, Controller, Delete, Get, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthResponseUser } from '../auth/dto/auth-response-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUserViewDto } from './dto/admin-user-view.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';

@ApiTags('Users (Admin)')
@Controller('users')      
@UseGuards(JwtAuthGuard, RolesGuard) 
@ApiCookieAuth() 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- GET /api/users ---
  @Get()
  @Roles(Role.PLATFORM_ADMIN) 
  @ApiOperation({ summary: 'Get a list of all users (Admin Only)' })
  @ApiResponse({ status: 200, description: 'List of users retrieved.', type: [AuthResponseUser] })
  async findAll(): Promise<AuthResponseUser[]> {
    return this.usersService.findAllUsers();
  }


  // --- GET /api/users/:id ---
  @Get(':id')
  @Roles(Role.PLATFORM_ADMIN) 
  @ApiOperation({ summary: 'Get a specific user by ID (Admin Only)' })
  @ApiParam({ name: 'id', description: 'User ID (UUID/CUID)', type: String }) 
  @ApiResponse({ status: 200, description: 'User details retrieved.', type: AuthResponseUser })
  async findOne(@Param('id') id: string): Promise<AuthResponseUser> {
    this.usersService.findUserById(id)
    const user = await this.usersService.findUserById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }

  // --- PATCH /api/users/:id ---
  @Patch(':id')
  @Roles(Role.PLATFORM_ADMIN) 
  @ApiOperation({ summary: 'Update a user by ID (Admin Only)' })
  @ApiParam({ name: 'id', description: 'User ID (UUID/CUID) to update', type: String })
  @ApiBody({ type: UpdateUserDto, description: 'Fields to update (all optional)' })
  @ApiResponse({ status: 200, description: 'User updated successfully.', type: AuthResponseUser })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<AuthResponseUser> {
      return this.usersService.updateUser(id, updateUserDto);
      
  }

  // --- DELETE /api/users/:id ---
    @Delete(':id')
    @Roles(Role.PLATFORM_ADMIN) 
    @HttpCode(HttpStatus.NO_CONTENT) 
    @ApiOperation({ summary: 'Delete a user by ID (Admin Only)' })
    @ApiParam({ name: 'id', description: 'ID of the user to delete', type: String })
    @ApiResponse({ status: 204, description: 'User deleted successfully.' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.usersService.deleteUser(id);
    }

  // --- NEW: POST /api/users endpoint ---
  @Post()
  @Roles(Role.PLATFORM_ADMIN) // Restrict to admins
  @HttpCode(HttpStatus.CREATED) // Set success status code to 201
  @ApiOperation({ summary: 'Admin: Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: AdminUserViewDto, // Specify return type for Swagger
  })
  async createUserByAdmin(
    @Body() createUserDto: CreateUserByAdminDto, // Validate body against DTO
  ): Promise<AdminUserViewDto> {
    try {
      return await this.usersService.createUserByAdmin(createUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException('Failed to create user.');
      }
    }
  }
  
}