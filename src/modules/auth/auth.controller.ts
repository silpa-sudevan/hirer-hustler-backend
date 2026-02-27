import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiBearerAuth('defaultBearerAuth')
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AccessTokenGuard)
  @Get('me')
  async me(@Request() req) {
    return this.authService.me(req.user.sub);
  }

  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(@Request() req) {
    return this.authService.generateAccessToken(req.user.sub);
  }

  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AccessTokenGuard)
  @Post('reset-password')
  async resetPassword(
    @Request() req,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const userId = req.user.sub;
    return this.authService.resetPassword(userId, resetPasswordDto);
  }

  //logout
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.sub);
  }
}
