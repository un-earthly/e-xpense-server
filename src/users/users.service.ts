import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async findOne(email: string): Promise<User | undefined> {
        const user = await this.userModel.findOne({ email }).exec();
        return user || undefined;
    }


    async findById(id: string): Promise<User | undefined> {
        const user = await this.userModel.findById(id).exec();
        return user || undefined;
    }


    async create(email: string, hashedPassword: string): Promise<User> {
        const newUser = new this.userModel({
            email,
            password: hashedPassword,
        });
        return newUser.save();
    }

    async updateResetPasswordToken(
        email: string,
        token: string,
        tokenExpires: Date,
    ): Promise<User | null> {
        return this.userModel.findOneAndUpdate(
            { email },
            {
                resetPasswordToken: token,
                resetPasswordTokenExpires: tokenExpires,
            },
            { new: true },
        );
    }

    async resetPassword(token: string, newPassword: string): Promise<User | null> {
        return this.userModel.findOneAndUpdate(
            {
                resetPasswordToken: token,
                resetPasswordTokenExpires: { $gt: new Date() },
            },
            {
                password: newPassword,
                resetPasswordToken: null,
                resetPasswordTokenExpires: null,
            },
            { new: true },
        );
    }
}