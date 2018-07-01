import { CanActivate, ExecutionContext, mixin } from '@nestjs/common';
import * as passport from 'passport';
import { UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { IType } from '../interface';

export interface Type<T = any> extends Function {
    new(...args: any[]): T;
}

export interface AuthGuardOptions {
    session?: boolean;
    property?: string;
    callback?: (err, user, info?) => any;
}

export const defaultOptions = {
    session: false,
    property: 'user',
    callback: (err, user, info) => {
        if (err || !user) {
            throw err || new UnauthorizedException();
        }
        return user;
    },
};

export function WsAuthGuard(
    type,
    options: AuthGuardOptions & { [key: string]: any } = defaultOptions,
): Type<CanActivate> {
    options = { ...defaultOptions, ...options };
    const guard = mixin(
        class implements CanActivate {
            async canActivate(context: ExecutionContext): Promise<boolean> {
                const wsContext = context.switchToWs();
                const client: Socket = wsContext.getClient();
                const passportFn = createPassportContext(client);
                const user = await passportFn(type, options);
                client.request[options.property || defaultOptions.property] = user;
                return true;
            }

            async logIn<TRequest extends { logIn: IType.Function } = any>(
                request: TRequest,
            ): Promise<void> {
                const user = request[options.property || defaultOptions.property];
                await new Promise((resolve, reject) =>
                    request.logIn(user, err => (err ? reject(err) : resolve())),
                );
            }
        },
    );
    return guard;
}

const createPassportContext = (client: Socket) => (type, options) =>
    new Promise((resolve, reject) =>
        passport.authenticate(type, options, (err, user, info) => {
            try {
                return resolve(options.callback(err, user, info));
            } catch (err) {
                reject(err);
            }
        })(client, resolve),
    );