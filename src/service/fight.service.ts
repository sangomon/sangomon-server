import {
    Injectable,
} from '@nestjs/common';
import { Observable, from, empty, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { CardService } from '../service/card.service';
import { IType } from '../interface';
import { $, _, MemoryCacheCommon } from '../common';
import { PlayerCardService } from './player_card.service';
import { PlayerService } from './player.service';

@Injectable()
export class FightService {

    constructor(
        private readonly playerCardService: PlayerCardService,
        private readonly playerService: PlayerService,
    ) { }

    public validSubmitCard(data: { playerCardId: IType.ID, time: number }) {
        const cards = MemoryCacheCommon.get('cards');

        try {
            this.validRemainTime(data.time);
            this.validCardBelong(data.playerCardId, cards);
        } catch (e) {
            return e;
        }
    }

    private validRemainTime(time: number) {
        if (time > 0) {
            throw { errorCode: 400001, errorMsg: '尚未恢复行动力' };
        }
    }

    private validCardBelong(playerCardId: IType.ID, cards: IType.Object[]) {
        if (!_.find(cards, { id: playerCardId })) {
            throw { errorCode: 400000, errorMsg: '不能使用非法的卡牌' };
        }
    }

    public getMyCards(playerId: IType.ID) {
        const playerCards = this.playerCardService.getMany();
        // const player = this.playerService.getOne(playerId);
        // const cards = this.randomPickCards(playerCards, player.level);
        // MemoryCacheCommon.set('cards', cards);
        // return cards;
    }

    private randomPickCards(playerCards: IType.Object[], limitNum: number) {
        return _(playerCards).shuffle().take(limitNum).value();
    }

    public submitCard(playerCardId: IType.ID) {
        const cards = MemoryCacheCommon.get('cards');
        MemoryCacheCommon.set('cards', _.reject(cards, { id: playerCardId }));
    }

}