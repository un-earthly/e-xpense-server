import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;
}

export class LoginDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;
}

export class ResetPasswordDto {
    @IsNotEmpty({ message: 'Reset token is required' })
    token: string;

    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    newPassword: string;
}
