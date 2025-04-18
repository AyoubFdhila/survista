import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminUserViewDto {
  @ApiProperty({ example: 'clp2a0r1x0000c8vwg8f9h7k3', description: 'Unique user ID' })
  userId: string;

  @ApiProperty({ example: 'admin.user@example.com', description: 'User email address' })
  email: string;

  @ApiProperty({ example: 'Admin User', description: 'User full display name' })
  name: string; 

  @ApiPropertyOptional({ example: 'Admin', description: "User's first name", nullable: true })
  @IsOptional() 
  @IsString()
  firstName?: string | null; 

  @ApiPropertyOptional({ example: 'User', description: "User's last name", nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string | null;

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