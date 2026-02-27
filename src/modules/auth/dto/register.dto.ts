import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/schemas/user.schema';

export class RegisterDto {
  @ApiProperty({ example: 'ARIA', description: 'Full name of the user' })
  @IsNotEmpty({ message: 'Please provide your name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'aria@gmail.com', description: 'User email' })
  @IsNotEmpty({ message: 'Please provide your email' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty({ message: 'Please provide your password' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsString()
  password: string;

  @ApiProperty({ 
    example: 'hirer', 
    description: 'User role',
    enum: UserRole 
  })
  @IsNotEmpty({ message: 'Please provide a role' })
  @IsEnum(UserRole, { message: 'Role must be either hirer or hustler' })
  role: UserRole;
}
