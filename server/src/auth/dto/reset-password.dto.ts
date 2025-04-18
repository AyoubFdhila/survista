import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'The selector part of the reset link', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Selector should not be empty.' })
  selector: string; 

  @ApiProperty({ description: 'The verifier token part of the reset link', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Reset token should not be empty.' })
  token: string; // PLAIN token

  @ApiProperty({ description: 'The new password (min 8 characters)', required: true, minLength: 8 })
  @IsString()
  @IsNotEmpty({ message: 'New password should not be empty.' })
  @MinLength(8, { message: 'New password must be at least 8 characters long.' })
  password: string;
}