import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; 

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user.to.reset@example.com',
    description: 'Email address of the user requesting password reset',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email address should not be empty.' })
  email: string;
}