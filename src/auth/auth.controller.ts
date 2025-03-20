import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    signIn(@Body() signInDto: LoginDto) {
        return this.authService.login(signInDto.email, signInDto.password);
    }

    @Post('register')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto.email, registerDto.password);
    }

    @Post('forgot-password')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

    @Post('reset-password')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    }
}
