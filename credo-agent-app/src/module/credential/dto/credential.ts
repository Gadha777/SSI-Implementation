import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class attributedto {
  @ApiProperty({ example: 'Name' }) // Attribute name
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'John Doe' }) // Attribute value
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class issueCredentialDto {
  @ApiProperty({ example: 'some-connection-id' })
  @IsString()
  @IsNotEmpty()
  connectionId: string;

  @ApiProperty({ example: 'some-credential-definition-id' })
  @IsString()
  @IsNotEmpty()
  credentialDefinitionId: string;

  @ApiProperty({
    type: [attributedto],
    example: [
      { name: 'Name', value: 'Alice' },
      { name: 'Course', value: 'Blockchain Basics' },
      { name: 'PhoneNo', value: '1234567890' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => attributedto)
  attributes: attributedto[];
}