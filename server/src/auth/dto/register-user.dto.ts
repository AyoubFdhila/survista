import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Unique email address for login' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsNotEmpty({ message: 'Full name should not be empty' })
  @IsString()
  name: string; 

  @ApiProperty({ example: 'Str0ngP@ssw0rd', description: 'User password (at least 8 characters)', minLength: 8 })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

}
