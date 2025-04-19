import { Injectable, ConflictException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { AuthResponseUser } from 'src/auth/dto/auth-response-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUserViewDto } from './dto/admin-user-view.dto';
import { UpdateMyDetailsDto } from './dto/update-my-details.dto';

interface CreateUserInput {
  email: string;
  name: string;
  role: Role;
  passwordHash?: string | null; 
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private prisma: PrismaService) {}

  // --- createUser Method ---
  async createUser(data: CreateUserInput): Promise<Omit<User, 'passwordHash'>> {

    const existingUser = await this.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    //Hash password ONLY if it's provided
    let hashedPassword: string | null = null;
    if (data.passwordHash) { 
      try {
        hashedPassword = await argon2.hash(data.passwordHash);
      } catch (hashError) {
        this.logger.error(`Failed to hash password for ${data.email}: ${hashError.message}`, hashError.stack);
        throw new InternalServerErrorException('Failed to secure user credentials.');
      }
    } else {
        this.logger.log(`Creating user ${data.email} without a password (OAuth).`);
    }


    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email.toLowerCase(), 
          name: data.name,
          role: data.role,
          passwordHash: hashedPassword, 
        },
      });

      this.logger.log(`Successfully created user: ${user.email} (ID: ${user.userId})`);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;

    } catch (error) {
       this.logger.error(`Failed to create user ${data.email} in DB: ${error.message}`, error.stack);
       throw new InternalServerErrorException('Could not create user.');
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findUserById(userId: string): Promise<User | null> {
     return this.prisma.user.findUnique({
         where: { userId },
     });
   }



    // --- find all users (for Admin) ---
  async findAllUsers(): Promise<AdminUserViewDto[]> {
    this.logger.log('Fetching all users request.');
    try {
      const users = await this.prisma.user.findMany({
        select: {
          userId: true,
          email: true,
          name: true,
          firstName: true, 
          lastName: true,  
          role: true,
          isActive: true,  
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return users;

    } catch (error) {
      this.logger.error(`Failed to fetch all users: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not retrieve users.');
    }
  }


  async updateUser(userId: string, data: UpdateUserDto): Promise<AuthResponseUser> {
    this.logger.log(`Attempting to update user ID: ${userId}`);

    
    const existingUser = await this.findUserById(userId); 
    if (!existingUser) {
        this.logger.warn(`Update failed: User not found with ID: ${userId}`);
        throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { userId: userId },
        data: {
          name: data.name, 
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role, 
          isActive: data.isActive, 
        },
        select: {
          userId: true,
          email: true,
          name: true,
          firstName: true, 
          lastName: true,  
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`Successfully updated user ID: ${userId}`);
      return updatedUser;

    } catch (error) {
      this.logger.error(`Failed to update user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not update user.');
    }
  }


  async deleteUser(userId: string): Promise<void> {
    this.logger.log(`Attempting to delete user ID: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      this.logger.warn(`Delete failed: User not found with ID: ${userId}`);
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    try {
      await this.prisma.user.delete({
        where: { userId: userId },
      });
      this.logger.log(`Successfully deleted user ID: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not delete user.');
    }
  }

  // --- ADD Method for user to update their own details ---
  async updateMyDetails(userId: string, data: UpdateMyDetailsDto): Promise<AuthResponseUser> {
    this.logger.log(`Attempting to update details for user ID: ${userId}`);

    try {
      
      const updatedUser = await this.prisma.user.update({
        where: { userId: userId },
        data: {
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
        },
        select: { 
          userId: true,
          email: true,
          name: true,
          role: true,
          firstName: true,
          lastName: true,},
      });

      this.logger.log(`Successfully updated details for user ID: ${userId}`);
      return updatedUser;

    } catch (error) {
      this.logger.error(`Failed to update details for user ${userId}: ${error.message}`, error.stack);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${userId} not found.`);
      }
      throw new InternalServerErrorException('Could not update user details.');
    }
  }
  
}