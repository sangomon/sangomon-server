import { Get, Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { _, Data, $ } from '../common';
import { IType } from '../interface';
import { AuthGuard } from '@nestjs/passport';
import { PlayerDeco } from '../decorator';
import { IData } from '../interface/data.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('players/:playerId/mons')
export class PlayerMonController {

    constructor() {

    }

    public isAuthorized(visitor: IType.ID, beVisitor: IType.ID) {
        if (visitor !== beVisitor) throw Error('没有访问权限');
    }

    @Get()
    async index(
        @Param('playerId') playerId: IType.ID,
        @PlayerDeco() me: IData.Player,
    ) {
        this.isAuthorized(me.id, playerId);

        const data = _.filter(Data.PLAYER_MONS, { playerId });
        for (const item of data) {
            const mon = _.find(Data.MONS, { id: item.monId });
            _.assign(item, { mon });
        }
        return data;
    }

}
