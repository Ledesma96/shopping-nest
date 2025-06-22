import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import 'dotenv/config';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

const cookieExtractor = (req: Request): string | null => {
    if (req && req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(), // Authorization: Bearer <token>
                cookieExtractor,                          // Cookie: token=<token>
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        return { _id: payload._id, role: payload.role };
    }
}
