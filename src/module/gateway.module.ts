import { Module } from '@nestjs/common';
import { ServiceModule } from './service.module';
import { FightGateway } from '../gateway/fight.gateway';
import { PlayerGateway } from '../gateway/player.gateway';
import { LoginGateway } from '../gateway/login.gateway';

@Module({
  imports: [ServiceModule],
  providers: [PlayerGateway, LoginGateway, FightGateway],
})
export class GatewayModule { }
