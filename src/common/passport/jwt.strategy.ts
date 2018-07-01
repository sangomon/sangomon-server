import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Data } from '../data.common';
import { IType } from '../../interface';
import { _ } from '../../common';

const tokenCookies = (req) => {
    let token: string | undefined;
    if (req && req.cookies) {
        token = req.cookies.token;
    }
    return token || '';
};
const tokenHeader = (req) => {
    let token: string | undefined;
    if (req && req.headers) {
        token = req.headers.authorization;
    }
    return token || '';
};
const tokenSocketQuery = (req) => {
    let token: string | undefined;
    if (req && req.request && req.request._query) {
        token = req.request._query.token;
    }
    return token || '';
};

const secretOrKey = 'cdh8h83YGHSD@*&HJSD*Y&#GFJHSJuhhd7';
const ISSUER = 'www.sangomon.club';
const AUDIENCE = 'www.sangomon.club';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([tokenCookies, tokenHeader, tokenSocketQuery]),
            secretOrKey,
            issuer: ISSUER,
            audience: AUDIENCE as string,
        });
    }

    async validate(payload: { id?: IType.ID }, done: IType.Function) {
        const account = _.find(Data.PLAYERS, { id: payload.id });
        if (!account) {
            return done(new UnauthorizedException(), false);
        }
        done(null, account);
    }

}