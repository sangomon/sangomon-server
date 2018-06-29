import { Module } from '@nestjs/common';
import { GatewayModule } from './gateway.module';
import { ControllerModule } from './controller.module';

@Module({
    imports: [GatewayModule, ControllerModule],
})
export class ApplicationModule {

    constructor() {

    }

}
