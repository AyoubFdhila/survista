// server/src/users/dto/admin-user-view.dto.ts
import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator'; // Import necessary validators if extending validation

export class AdminUserViewDto {
  @ApiProperty({ example: 'clp2a0r1x0000c8vwg8f9h7k3', description: 'Unique user ID' })
  userId: string;

  @ApiProperty({ example: 'admin.user@example.com', description: 'User email address' })
  email: string;

  @ApiProperty({ example: 'Admin User', description: 'User full display name' })
  name: string; // Keep the main name field

  // --- ADD THESE FIELDS ---
  @ApiPropertyOptional({ example: 'Admin', description: "User's first name", nullable: true })
  @IsOptional() // Mark as optional in DTO if they can be null/missing
  @IsString()
  firstName?: string | null; // Match Prisma type String?

  @ApiPropertyOptional({ example: 'User', description: "User's last name", nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string | null; // Match Prisma type String?
  // --- END OF ADDED FIELDS ---

  @ApiProperty({ enum: Role, example: Role.PLATFORM_ADMIN, description: 'User role' })
  role: Role;

  @ApiProperty({ example: true, description: 'User account active status' })
  isActive: boolean;

  @ApiProperty({ type: String, format: 'date-time', example: '2024-04-17T10:30:00.000Z', description: 'Timestamp of last login', nullable: true })
  lastLogin: Date | null;

  @ApiProperty({ type: String, format: 'date-time', example: '2024-04-16T08:00:00.000Z', description: 'Timestamp of user creation' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time', example: '2024-04-17T10:00:00.000Z', description: 'Timestamp of last update' })
  updatedAt: Date;
}