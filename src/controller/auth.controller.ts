import { Get, Controller, Post, Body } from '@nestjs/common';
import { _, Data, $ } from '../common';
import { IType } from '../interface';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {

    constructor() {

    }

    @Post('register')
    postRegister(
        @Body() body: { phone: string },
    ): IType.Object {
        const account = {
            id: $.getId(),
            phone: body.phone,
        };
        Data.PLAYERS.push(account);

        return account;
    }

    @Post('login')
    postLogin(
        @Body() body: { phone: string },
    ): IType.Object {
        const account = _.find(Data.PLAYERS, { phone: body.phone });

        if (account) {
            const secretOrKey = 'cdh8h83YGHSD@*&HJSD*Y&#GFJHSJuhhd7';
            const ISSUER = 'www.sangomon.club';
            const AUDIENCE = 'www.sangomon.club';
            const EXPIRES_IN = '2d';

            const opt: jwt.SignOptions = {
                issuer: ISSUER,
                audience: AUDIENCE,
                expiresIn: EXPIRES_IN,
            };
            return jwt.sign(account, secretOrKey, opt);
        } else {
            throw Error('手机号尚未注册');
        }
    }

}
