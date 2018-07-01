import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './module/app.module';
import * as util from 'util';
import * as fs from 'fs';
import { AnyExceptionFilter } from './filter/any_exception.filter';

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
    const httpsOptions = {
        key: fs.readFileSync('cert/sangomon.key'),
        cert: fs.readFileSync('cert/sangomon.pem'),
    };

    const app = await NestFactory.create(ApplicationModule, {
        httpsOptions,
        cors: true,
        bodyParser: true,
    });

    app.useGlobalFilters(new AnyExceptionFilter());

    await app.listen(3000);
}
bootstrap();
