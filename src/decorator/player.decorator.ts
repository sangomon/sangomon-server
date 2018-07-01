import { createParamDecorator } from '@nestjs/common';

export const PlayerDeco = createParamDecorator((data, req) => {
    return req.user;
});