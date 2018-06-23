import {
    WebSocketGateway,
    SubscribeMessage,
    WsResponse,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Observable, from, empty, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { IType } from '../interface';
import { $, _, MemoryCacheCommon } from '../common';
import { Server, Client, Socket } from 'socket.io';
import { FightService } from '../service/fight.service';

@WebSocketGateway()
export class FightGateway {

    @WebSocketServer() server: Server;

    constructor(
        // private readonly fightService: FightService,
    ) {

    }

    @SubscribeMessage('joinRoom')
    async onJoinRoom(client: Socket, data) {
        const event = 'joinRoom';
        const roomId = data.roomId;

        client.leaveAll();
        client.join(roomId);

        this.server.in(roomId).emit(event, `玩家${client.id}加入${roomId}房间`);
        return empty();
    }

    @SubscribeMessage('useSkill')
    async onUseSkill(client: Socket, data) {
        const event = 'useSkill';
        const skillId = data.skillId;
        const roomId = _.keys(client.rooms)[0];

        this.server.in(roomId).emit(event, `玩家${client.id}使用${skillId}技能`);
        return empty();
    }

}
