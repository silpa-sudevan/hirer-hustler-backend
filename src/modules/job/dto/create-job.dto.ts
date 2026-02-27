import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ example: 'Full Stack Developer Needed', description: 'Job title' })
  @IsNotEmpty({ message: 'Please provide a title' })
  @IsString()
  title: string;

  @ApiProperty({ 
    example: 'Looking for an experienced full stack developer to build a web application', 
    description: 'Detailed job description' 
  })
  @IsNotEmpty({ message: 'Please provide a description' })
  @IsString()
  description: string;

  @ApiProperty({ example: 5000, description: 'Budget in USD' })
  @IsNotEmpty({ message: 'Please provide a budget' })
  @IsNumber()
  @Min(0, { message: 'Budget must be a positive number' })
  budget: number;

  @ApiProperty({ 
    example: ['React', 'Node.js', 'MongoDB'], 
    description: 'Required skills for the job' 
  })
  @IsNotEmpty({ message: 'Please provide required skills' })
  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[];
}
