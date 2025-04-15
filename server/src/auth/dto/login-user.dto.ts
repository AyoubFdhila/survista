import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'Str0ngP@ssw0rd', description: 'User password' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString()
  password: string;
}
