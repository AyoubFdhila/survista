import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Updated User Name', description: "User's full name" })
  @IsOptional() 
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Admin', description: "User's first name", nullable: true })
  @IsOptional() 
  @IsString()
  firstName?: string | null; 

  @ApiPropertyOptional({ example: 'User', description: "User's last name", nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string | null;
  
  @ApiPropertyOptional({ enum: Role, example: Role.SURVEY_MANAGER, description: "User's role" })
  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role specified.' })
  role?: Role;

  @ApiPropertyOptional({ example: false, description: "User's active status" })
  @IsOptional()
  @IsBoolean({ message: 'Active status must be a boolean.' })
  isActive?: boolean;

  

 
}