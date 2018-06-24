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

@WebSocketGateway()
export class PlayerGateway {

    @WebSocketServer() server: Server;

    constructor(
        // private readonly playerService: PlayerService,
    ) {

    }

    @SubscribeMessage('getMany')
    async onGetMany(client: Socket, data: { params?: { includeMe?: 0 | 1 } }) {
        const event = 'getMany';
        const { params } = data;

        let players = LoginGateway.PLAYERS;
        if (params && params.includeMe === 0) {
            players = _.without(players, client.id);
        }
        return { event, data: players };
    }

    @SubscribeMessage('sendFight')
    async onSendFight(client: Socket, data) {
        const event = 'sendFight';
        const playerClientId = data.playerId;
        const roomId = $.getId();

        // 初始化房间配置
        _.assign(FightGateway.ROOM_CONFIGS, {
            [roomId]: {
                turn: [],
                playerIds: [],
                maxWaitTime: 30,
                players: [],
            },
        });

        client.to(playerClientId).emit('fetchFight', {
            message: `玩家${client.id}邀请你加入决斗`,
            invitePlayerId: client.id,
            roomId,
        });
        return from([roomId]).pipe(map(res => ({ event, data: res })));
    }

    @SubscribeMessage('rejectFight')
    async rejectFight(client: Socket, data) {
        const event = 'rejectFight';
        const roomId = data.roomId;

        client.to(roomId).emit('exception', {
            message: `玩家${client.id}拒绝加入决斗`,
            roomId,
        });
        return empty();
    }

}
