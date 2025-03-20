import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

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

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                email: user.email,
            },
        };
    }

    async register(email: string, password: string) {
        // Check if user already exists
        const existingUser = await this.userModel.findOne({ email });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const newUser = new this.userModel({
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        const payload = { sub: savedUser._id, email: savedUser.email };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: savedUser._id,
                email: savedUser.email,
            },
        };
    }

    async forgotPassword(email: string) {
        const user = await this.userModel.findOne({ email });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 1); // Token expires in 1 hour

        // Save token to user
        await this.userModel.updateOne(
            { _id: user._id },
            {
                resetPasswordToken: token,
                resetPasswordTokenExpires: tokenExpires,
            },
        );

        // In a real application, send an email with the reset link
        return {
            message: 'Password reset email sent',
            // For development purposes only
            debug: {
                token,
                expires: tokenExpires,
            },
        };
    }

    async resetPassword(token: string, newPassword: string) {
        // Find user with this token and token not expired
        const user = await this.userModel.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpires: { $gt: new Date() },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user password and remove token fields
        await this.userModel.updateOne(
            { _id: user._id },
            {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordTokenExpires: null,
            },
        );

        return {
            message: 'Password reset successful',
        };
    }
}