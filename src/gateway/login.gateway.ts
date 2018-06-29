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
import { Data } from '../common/data.common';

@WebSocketGateway()
export class LoginGateway {

    @WebSocketServer() server: Server;

    constructor(

    ) {

    }

    @SubscribeMessage('login')
    async onLogin(client: Socket, data) {
        const event = 'login';
        const token = data.token;
        // TODO: 解析 Token
        const { phone } = { phone: token };

        Data.PLAYERS.push({
            clientId: client.id,
            phone,
        });
        return from([`玩家ID ${client.id} 已经登录成功`]).pipe(map(res => ({
            event, data: {
                message: res,
                playerId: client.id,
                phone,
            },
        })));
    }

    @SubscribeMessage('disconnect')
    async disconnect(client: Socket, data) {
        const event = 'disconnect';

        Data.PLAYERS = _.reject(Data.PLAYERS, { clientId: client.id });
        console.log(`${client.id} 断开了链接`);

        return empty();
    }

    @SubscribeMessage('connect')
    async connect(client: Socket, data) {
        const event = 'connect';

        console.log(`${client.id} 打开了链接`);

        return empty();
    }

}
