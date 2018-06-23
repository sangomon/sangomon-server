import { Module } from '@nestjs/common';
import { CardService } from '../service/card.service';
import { FightService } from '../service/fight.service';
import { PlayerCardService } from '../service/player_card.service';
import { PlayerService } from '../service/player.service';

@Module({
  providers: [CardService, FightService, PlayerCardService, PlayerService],
  exports: [CardService, FightService, PlayerCardService, PlayerService],
})
export class ServiceModule { }
