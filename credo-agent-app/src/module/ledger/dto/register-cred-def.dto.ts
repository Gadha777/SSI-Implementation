import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterCredDefDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  schemaId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  issuerId: string;
}
