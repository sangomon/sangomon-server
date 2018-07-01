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
import { WsAuthGuard } from '../guard/auth.guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway()
export class PlayerGateway {

    @WebSocketServer() server: Server;

    constructor(
        // private readonly playerService: PlayerService,
    ) {

    }

    @UseGuards(WsAuthGuard('jwt'))
    @SubscribeMessage('getMany')
    async onGetMany(client: Socket, data: { params?: { includeMe?: 0 | 1 } } = {}) {
        const me = client.request.user;
        const event = 'getMany';
        const params = data.params;

        let players = Data.ONLINE_PLAYERS;
        if (params && params.includeMe === 0) {
            players = _.reject(Data.ONLINE_PLAYERS, { playerId: me.id });
        }
        return { event, data: players };
    }

    @UseGuards(WsAuthGuard('jwt'))
    @SubscribeMessage('sendFight')
    async onSendFight(client: Socket, data) {
        const me = client.request.user;
        const event = 'sendFight';
        const playerId = data.playerId;
        const roomId = $.getId();

        // 初始化房间配置
        _.assign(Data.ROOM_CONFIG, {
            [roomId]: {
                turn: [],
                playerIds: [],
                maxWaitTime: 30,
                playerMons: [],
            },
        });

        const player = _.find(Data.ONLINE_PLAYERS, { playerId });
        if (player)
            client.to(player.clientId).emit('fetchFight', {
                message: `玩家${me.id}邀请你加入决斗`,
                invitePlayerId: me.id,
                roomId,
            });
        return from([roomId]).pipe(map(res => ({ event, data: res })));
    }

    @UseGuards(WsAuthGuard('jwt'))
    @SubscribeMessage('rejectFight')
    async rejectFight(client: Socket, data) {
        const me = client.request.user;
        const event = 'rejectFight';
        const roomId = data.roomId;

        client.to(roomId).emit('warn', {
            message: `玩家${me.id}拒绝加入决斗`,
            roomId,
        });
        return empty();
    }

}
