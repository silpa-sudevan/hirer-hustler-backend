import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    const tokens = this.generateTokens(user);
    return {
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) throw new BadRequestException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('User is not active');

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) throw new BadRequestException('Invalid credentials');

    const tokens = this.generateTokens(user);
    return tokens;
  }

  async me(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new BadRequestException('User not found');
    if (!user.isActive) throw new UnauthorizedException('User is not active');

    return {
      message: 'User fetched successfully',
      data: user,
    };
  }

  private generateTokens(user: UserDocument | any) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'default-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
    } as any);

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    } as any);

    return { accessToken, refreshToken };
  }

  async generateAccessToken(userId: string) {
    const userDetails = await this.userModel
      .findOne({ _id: new Types.ObjectId(userId), isActive: true })
      .lean();
    if (!userDetails) throw new BadRequestException('User not found');
    if (!userDetails.isActive)
      throw new UnauthorizedException('User is not active');

    const tokens = this.generateTokens(userDetails);
    return tokens.accessToken;
  }

  async resetPassword(userId: string, resetPasswordDto: ResetPasswordDto) {
    const { oldPassword, newPassword } = resetPasswordDto;

    // Find user by ID
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new BadRequestException('User not found');
    if (!user.isActive) throw new UnauthorizedException('User is not active');

    // Check old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password!);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    // Update user's password
    user.password = newPassword;
    await user.save();

    return { message: 'Password successfully updated' };
  }

  async logout(userId: string) {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { refreshToken: null } },
    );
    return { message: 'Logout successfully' };
  }
}
