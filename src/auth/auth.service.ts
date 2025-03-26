import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { ResponseUtil } from '../common/utils/response.util';
import { RegisterDto } from './dto/auth.dto';


@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ) { }

    async login(email: string, password: string) {
        const user = await this.userModel.findOne({ email });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user._id, email: user.email };
        const access_token = this.jwtService.sign(payload);

        return ResponseUtil.success('Login successful', {
            access_token,
            user: {
                id: user._id,
                email: user.email,
            }
        });
    }

    async register(registerDto: RegisterDto) {
        const { email, password, firstName, lastName } = registerDto;

        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.userModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        });

        const payload = { sub: user._id, email: user.email };
        const access_token = this.jwtService.sign(payload);

        return ResponseUtil.success('User registered successfully', {
            access_token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    }

    async forgotPassword(email: string) {
        const user = await this.userModel.findOne({ email });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 1); // Token expires in 1 hour

        await this.userModel.updateOne(
            { _id: user._id },
            {
                resetPasswordToken: token,
                resetPasswordTokenExpires: tokenExpires,
            },
        );

        return ResponseUtil.success('Password reset email sent', {
            debug: {
                token,
                expires: tokenExpires,
            }
        });
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.userModel.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpires: { $gt: new Date() },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await this.userModel.updateOne(
            { _id: user._id },
            {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordTokenExpires: null,
            },
        );

        return ResponseUtil.success('Password reset successful');
    }
}