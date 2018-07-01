import { Module, Provider } from '@nestjs/common';
import { ServiceModule } from './service.module';
import * as Gateways from '../gateway';
import { JwtStrategy } from '../common/passport/jwt.strategy';

const gateways: Provider[] = [];
for (const key in Gateways) {
    if (Gateways[key]) gateways.push(Gateways[key]);
}
gateways.push(JwtStrategy);

@Module({
    imports: [ServiceModule],
    providers: gateways,
})
export class GatewayModule { }
