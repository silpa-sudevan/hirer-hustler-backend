import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateJobDto {
  @ApiProperty({ example: 'Full Stack Developer Needed', description: 'Job title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ 
    example: 'Looking for an experienced full stack developer', 
    description: 'Job description',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 5000, description: 'Budget in USD', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Budget must be a positive number' })
  budget?: number;

  @ApiProperty({ 
    example: ['React', 'Node.js', 'MongoDB'], 
    description: 'Required skills',
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];
}
