import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Updated User Name', description: "User's full name" })
  @IsOptional() 
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.SURVEY_MANAGER, description: "User's role" })
  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role specified.' })
  role?: Role;

  @ApiPropertyOptional({ example: false, description: "User's active status" })
  @IsOptional()
  @IsBoolean({ message: 'Active status must be a boolean.' })
  isActive?: boolean;

  

 
}