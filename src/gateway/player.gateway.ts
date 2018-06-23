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
import { $ } from '../common';
import { LoginGateway } from './login.gateway';

@WebSocketGateway()
export class PlayerGateway {

    @WebSocketServer() server: Server;

    constructor(
        // private readonly playerService: PlayerService,
    ) {

    }

    @SubscribeMessage('getMany')
    async onGetMany(client: Socket, data) {
        const event = 'getMany';
        const response = LoginGateway.PLAYERS;
        return from(response).pipe(map(res => ({ event, data: res })));
    }

    @SubscribeMessage('sendFight')
    async onSendFight(client: Socket, data) {
        const event = 'sendFight';
        const playerClientId = data.playerId;
        const roomId = $.getId();

        client.to(playerClientId).emit('fetchFight', {
            message: `玩家${client.id}邀请你加入决斗`,
            invitePlayerId: client.id,
            roomId,
        });
        return from([roomId]).pipe(map(res => ({ event, data: res })));
    }

}
