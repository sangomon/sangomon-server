import { Module, Type } from '@nestjs/common';
import * as Controllers from '../controller';

const controllers: Type<any>[] = [];
for (const key in Controllers) {
    if (Controllers[key]) controllers.push(Controllers[key]);
}

@Module({
    controllers,
})
export class ControllerModule { }
