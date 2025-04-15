import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AuthResponseUser {
  @ApiProperty({ example: 'clq9v1r3p0000u9qk3f7q7z1z' })
  userId: string;

  @ApiProperty({ example: 'user@survista.com' })
  email: string;

  @ApiProperty({ example: 'test ' })
  name: string;

  @ApiProperty({ enum: Role, example: Role.SURVEY_MANAGER })
  role: Role;
}

