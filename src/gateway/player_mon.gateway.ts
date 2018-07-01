import {
    WebSocketGateway,
    SubscribeMessage,
    WsResponse,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Observable, from, empty } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlayerService } from '../service/player.service';
import { Server, Client, Socket } from 'socket.io';
import { $, _ } from '../common';
import { LoginGateway } from './login.gateway';
import { FightGateway } from './fight.gateway';
import { Data } from '../common/data.common';
import { UseGuards } from '../../node_modules/@nestjs/common';
import { AuthGuard } from '../../node_modules/@nestjs/passport';
import { IData } from '../interface/data.interface';
import { WsAuthGuard } from '../guard/auth.guard';

@WebSocketGateway()
export class PlayerMonGateway {

    @WebSocketServer() server: Server;

    constructor(
    ) {
    }

    @UseGuards(WsAuthGuard('jwt'))
    @SubscribeMessage('getOneMon')
    async getOneMon(
        client: Socket,
        data = {},
    ) {
        const me = client.request.user;
        const event = 'getOneMon';

        const mon = _.shuffle(Data.MONS)[0];
        const myMon = {
            id: $.getId(),
            playerId: me.id,
            monId: mon.id,
            hp: { current: mon.hp, max: mon.hp },
            state: {
                isPoisoned: false,
            },
        };
        Data.PLAYER_MONS.push(myMon);
        return { event, data: myMon };
    }

}
