// server/src/users/dto/update-my-details.dto.ts
import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMyDetailsDto {
  @ApiPropertyOptional({
    description: "User's updated full display name",
    example: 'Jane R. Doe',
  })
  @IsOptional() // All fields are optional for PATCH-like updates
  @IsString()
  @MinLength(1) // Ensure name is not just empty spaces if provided
  name?: string;

  @ApiPropertyOptional({
    description: "User's updated first name",
    example: 'Jane',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string | null;

  @ApiPropertyOptional({
    description: "User's updated last name",
    example: 'Doe',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string | null;
}