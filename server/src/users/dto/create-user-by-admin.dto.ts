
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client'; 
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserByAdminDto {
  @ApiProperty({
    description: "User's email address (must be unique)",
    example: 'new.user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @ApiProperty({
    description: "User's display name (can be full name or username)",
    example: 'New User Name',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  name: string;

  @ApiProperty({
    description: "User's initial password (min 8 characters)",
    example: 'Str0ngP@sswOrd',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;

  @ApiProperty({
    description: "User's role",
    enum: Role,
    example: Role.SURVEY_MANAGER,
  })
  @IsEnum(Role, { message: 'Invalid role specified.' })
  @IsNotEmpty({ message: 'Role is required.' })
  role: Role;
}