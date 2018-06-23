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
    public static ROOM_CONFIGS: {
        [roomId: string]: {
            turn: IType.ID[],
            playerIds: IType.ID[],
            maxWaitTime: number,
        },
    } = {};

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

    @SubscribeMessage('confirmFight')
    async confirmFight(client: Socket, data) {
        const event = 'confirmFight';
        const roomId = _.keys(client.rooms)[0];

        // 准备
        FightGateway.ROOM_CONFIGS[roomId].playerIds.push(client.id);

        this.server.in(roomId).emit(event, `玩家${client.id}确认比赛`);

        // 等待所有玩家准备
        const playerIds = FightGateway.ROOM_CONFIGS[roomId].playerIds;
        if (playerIds.length === 2) {
            const turn = _.shuffle(playerIds);
            // 这次请求后, 完全准备好了
            // 开始初始化比赛配置
            _.merge(FightGateway.ROOM_CONFIGS, {
                [roomId]: {
                    turn,
                    maxWaitTime: 30,
                },
            });

            this.server.in(roomId).emit(event, `全部确认完毕, 开始比赛`);
            this.server.in(roomId).emit('room', {
                turn,
            });
        }

        return empty();
    }

    private checkIsTurnPlayer(roomId: IType.ID, playerId: IType.ID) {
        const turn = FightGateway.ROOM_CONFIGS[roomId].turn;
        if (turn[0] === playerId) return true;
        return false;
    }

    private turnPlayers(roomId: IType.ID) {
        const turn = FightGateway.ROOM_CONFIGS[roomId].turn;

        const first = turn.shift();
        turn.push(first);
        FightGateway.ROOM_CONFIGS[roomId].turn = turn;
        return turn;
    }

    @SubscribeMessage('useSkill')
    async onUseSkill(client: Socket, data) {
        const event = 'useSkill';
        const skillId = data.skillId;
        const roomId = _.keys(client.rooms)[0];

        const isTurnPlayer = this.checkIsTurnPlayer(roomId, client.id);
        if (!isTurnPlayer) return from([`还没有到出手时机`]).pipe(map(res => ({ event, data: res })));

        // 通知下一轮
        const turn = this.turnPlayers(roomId);
        this.server.in(roomId).emit('room', {
            turn,
        });

        this.server.in(roomId).emit(event, `玩家${client.id}使用${skillId}技能`);
        return empty();
    }

}
