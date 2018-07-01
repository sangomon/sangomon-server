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
import { IData } from '../interface/data.interface';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../guard/auth.guard';

@WebSocketGateway()
export class LoginGateway {

    @WebSocketServer() server: Server;

    constructor(

    ) {

    }

    @UseGuards(WsAuthGuard('jwt'))
    @SubscribeMessage('login')
    async onLogin(
        client: Socket,
        data = {},
    ) {
        const me = client.request.user;
        const event = 'login';
        Data.ONLINE_PLAYERS.push({
            clientId: client.id,
            playerId: me.id,
        });
        return from([`玩家ID ${me.id} 已经登录成功`]).pipe(map(res => ({
            event, data: {
                message: res,
                clientId: client.id,
                playerId: me.id,
            },
        })));
    }

    @SubscribeMessage('disconnect')
    async disconnect(client: Socket, data) {
        const event = 'disconnect';

        Data.ONLINE_PLAYERS = _.reject(Data.ONLINE_PLAYERS, { clientId: client.id });
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
