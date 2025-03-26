import {
    Controller,
    Get,
    Put,
    Delete,
    UseGuards,
    Body,
    HttpStatus,
    NotFoundException,
    ConflictException,
    HttpCode
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './schemas/user.schema';
import { UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { GetUser } from './user.decorator';
import { ResponseUtil } from '../common/utils/response.util';
import { ApiResponse } from '../common/interfaces/api-response.interface';


@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async getProfile(@GetUser() user: User): Promise<ApiResponse<UserResponseDto>> {
        try {
            const userProfile = await this.usersService.findById(user._id);

            if (!userProfile) {
                throw new NotFoundException('User profile not found');
            }

            const responseData: UserResponseDto = {
                id: userProfile._id,
                email: userProfile.email,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                lastLoginAt: userProfile.lastLoginAt,
            };

            return ResponseUtil.success('User profile retrieved successfully', responseData);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw ResponseUtil.error(
                    'User profile not found',
                    'USER_NOT_FOUND'
                );
            }
            throw ResponseUtil.error(
                'Error retrieving user profile',
                'INTERNAL_SERVER_ERROR',
                error.message
            );
        }
    }

    @Put('profile')
    @HttpCode(HttpStatus.OK)
    async updateProfile(
        @GetUser() user: User,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<ApiResponse<UserResponseDto>> {
        try {
            const updatedUser = await this.usersService.update(
                user._id,
                updateUserDto
            );

            const responseData: UserResponseDto = {
                id: updatedUser._id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                lastLoginAt: updatedUser.lastLoginAt,
            };

            return ResponseUtil.success('User profile updated successfully', responseData);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw ResponseUtil.error(
                    'User profile not found',
                    'USER_NOT_FOUND'
                );
            }
            if (error.code === 11000) {
                throw ResponseUtil.error(
                    'Email already exists',
                    'EMAIL_DUPLICATE'
                );
            }
            throw ResponseUtil.error(
                'Error updating user profile',
                'INTERNAL_SERVER_ERROR',
                error.message
            );
        }
    }

    @Delete('profile')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteProfile(@GetUser() user: User): Promise<void> {
        try {
            await this.usersService.remove(user._id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw ResponseUtil.error(
                    'User profile not found',
                    'USER_NOT_FOUND'
                );
            }
            throw ResponseUtil.error(
                'Error deleting user profile',
                'INTERNAL_SERVER_ERROR',
                error.message
            );
        }
    }
}