import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'I have 5 years of experience...', description: 'Application message' })
  @IsNotEmpty({ message: 'Please provide a message' })
  @IsString()
  message: string;

  @ApiProperty({ example: 4500, description: 'Expected cost in USD' })
  @IsNotEmpty({ message: 'Please provide expected cost' })
  @IsNumber()
  @Min(0, { message: 'Expected cost must be a positive number' })
  expectedCost: number;
}
