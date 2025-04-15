import { Injectable, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, Role } from '@prisma/client';
import * as argon2 from 'argon2';

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

}