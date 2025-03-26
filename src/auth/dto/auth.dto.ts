import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2, { message: 'First name must be at least 2 characters long' })
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2, { message: 'Last name must be at least 2 characters long' })
    lastName: string;

    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
    })
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
