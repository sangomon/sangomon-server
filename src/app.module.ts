import { Module } from '@nestjs/common';
import { GatewayModule } from './module/gateway.module';
import { MemoryCacheCommon } from './common';

@Module({
    imports: [GatewayModule],
})
export class ApplicationModule {

    constructor() {
        MemoryCacheCommon.cache = {};
    }

}
