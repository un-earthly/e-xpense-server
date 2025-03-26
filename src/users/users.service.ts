import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

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

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const updates: any = { ...updateUserDto };

        if (updates.password) {
            const salt = await bcrypt.genSalt();
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        ).exec();

        if (!updatedUser) {
            throw new NotFoundException(`User with ID "${id}" not found`);
        }

        return updatedUser;
    }

    async remove(id: string): Promise<void> {
        const result = await this.userModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`User with ID "${id}" not found`);
        }
    }
}