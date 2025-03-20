import { Controller, Get, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from './interfaces/user.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('profile')
    async getProfile(@Req() req: Request) {
        if (!req.user) {
            throw new NotFoundException(`User not found`);
        }
        const userId = req.user['userId'];

        const user: Partial<User> | undefined = await this.usersService.findById(userId);

        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }

        return {
            id: user._id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
        };
    }
}