import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;
}


export class UserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    lastLoginAt: Date;
    createdAt?: Date;
}