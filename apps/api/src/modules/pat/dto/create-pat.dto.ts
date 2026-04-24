import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreatePatDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  // Expiry in days; defaults to 90, max 365
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresInDays?: number;
}
