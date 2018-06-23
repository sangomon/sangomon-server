import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { MemoryCacheCommon } from './common';
import * as util from 'util';

// 原生方法注入
const console_log = console.log;
console.log = function log(...objs: any[]): void {
    for (const obj of objs) {
        console_log(`[${new Date().toLocaleString()}] - `, obj);
    }
};
console.debug = function dump(...objs: any[]): void {
    for (const obj of objs) {
        console.log(util.inspect(obj, true, 8, true));
    }
};

async function bootstrap() {
    const app = await NestFactory.create(ApplicationModule);
    await app.listen(3000);
}
bootstrap();
