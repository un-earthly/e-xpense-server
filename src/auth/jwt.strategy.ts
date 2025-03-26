import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

interface JwtPayload {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'SECRET_KEY',
        });
        // Debug log
        console.log('JWT Strategy initialized with secret:',
            (configService.get<string>('JWT_SECRET') || 'SECRET_KEY').substring(0, 3) + '...');
    }

    async validate(payload: JwtPayload) {
        console.log('Validating JWT payload:', payload); // Debug log
        const user = await this.usersService.findById(payload.sub);
        console.log('Found user:', user ? 'Yes' : 'No'); // Debug log

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User is inactive');
        }

        return user;
    }
}
