import { Get, Controller, Post, Body } from '@nestjs/common';
import { _, Data, $ } from '../common';
import { IType } from '../interface';

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
        Data.ACCOUNTS.push(account);
        return account;
    }

    @Post('login')
    postLogin(
        @Body() body: { phone: string },
    ): IType.Object {
        const account = _.find(Data.ACCOUNTS, { phone: body.phone });
        if (account) {
            return account;
        } else {
            throw Error('手机号尚未注册');
        }
    }

}
