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
export class LoginGateway {

    @WebSocketServer() server: Server;

    public static PLAYERS: IType.ID[] = [];

    constructor(
        // private readonly fightService: FightService,
    ) {

    }

    @SubscribeMessage('login')
    async onLogin(client: Socket, data) {
        const event = 'login';
        LoginGateway.PLAYERS.push(client.id);
        return from([`玩家ID ${client.id} 已经登录成功`]).pipe(map(res => ({ event, data: res })));
    }

}
