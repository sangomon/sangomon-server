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

    @SubscribeMessage('leaveRoom')
    async leaveRoom(client: Socket, data) {
        const event = 'leaveRoom';
        const roomId = _.keys(client.rooms)[0];

        client.leaveAll();
        client.join(client.id);

        this.server.in(roomId).emit(event, `玩家${client.id}离开${roomId}房间`);
        return empty();
    }

    @SubscribeMessage('confirmFight')
    async confirmFight(client: Socket, data) {
        const event = 'confirmFight';
        const roomId = _.keys(client.rooms)[0];

        // 确认准备
        Data.ROOM_CONFIGS[roomId].playerIds.push(client.id);
        Data.ROOM_CONFIGS[roomId].players.push({
            id: client.id,
            hp: 30,
        });

        this.server.in(roomId).emit(event, `玩家${client.id}确认比赛`);

        // 等待所有玩家准备
        const playerIds = Data.ROOM_CONFIGS[roomId].playerIds;
        if (playerIds.length === 2) {
            const turn = _.shuffle(playerIds);
            // 这次请求后, 完全准备好了
            // 开始初始化比赛配置
            _.merge(Data.ROOM_CONFIGS, {
                [roomId]: {
                    turn,
                    maxWaitTime: 30,
                },
            });

            this.server.in(roomId).emit(event, `全部确认完毕, 开始比赛`);
            this.server.in(roomId).emit('useSkill', {
                turn,
                players: Data.ROOM_CONFIGS[roomId].players,
            });
        }

        return empty();
    }

    @SubscribeMessage('useSkillStart')
    async useSkillStart(client: Socket, data) {
        const event = 'useSkillStart';
        const roomId = _.keys(client.rooms)[0];

        this.server.in(roomId).emit('useSkill', Data.ROOM_CONFIGS[roomId]);
        return empty();
    }

    private checkIsTurnPlayer(roomId: IType.ID, playerId: IType.ID) {
        const turn = Data.ROOM_CONFIGS[roomId].turn;
        if (turn[0] === playerId) return true;
        return false;
    }

    private turnPlayers(roomId: IType.ID) {
        const turn = Data.ROOM_CONFIGS[roomId].turn;

        const first = turn.shift();
        if (first) turn.push(first);
        Data.ROOM_CONFIGS[roomId].turn = turn;
        return turn;
    }

    private attack(roomId: IType.ID, mePlayerId: IType.ID, skillId: number) {
        const isSuccess = _.random(1, skillId) === 1;
        if (isSuccess) {
            const damage = skillId * _.random(1, 10);
            const enemyPlayer = _.reject(Data.ROOM_CONFIGS[roomId].players, { id: mePlayerId })[0];
            enemyPlayer.hp -= damage;
            this.server.in(roomId).emit('fight', `玩家${mePlayerId}使用${skillId}技能,造成${damage}伤害`);
        } else {
            const damage = skillId + _.random(1, 2);
            const enemyPlayer = _.reject(Data.ROOM_CONFIGS[roomId].players, { id: mePlayerId })[0];
            enemyPlayer.hp -= damage;
            this.server.in(roomId).emit('fight', `玩家${mePlayerId}力气不足,使用${skillId}技能,造成${damage}伤害`);
        }
    }

    private endFight(roomId: IType.ID) {
        for (const player of Data.ROOM_CONFIGS[roomId].players) {
            if (player.hp <= 0) {
                this.server.in(roomId).emit('fightStatus', {
                    winPlayer: _.reject(Data.ROOM_CONFIGS[roomId].players, player)[0].id,
                    losePlayer: player.id,
                });
                delete Data.ROOM_CONFIGS[roomId];
                return true;
            }
        }
        return false;
    }

    @SubscribeMessage('useSkill')
    async onUseSkill(client: Socket, data) {
        const event = 'useSkill';
        const skillId = data.skillId;
        const roomId = _.keys(client.rooms)[0];

        const isTurnPlayer = this.checkIsTurnPlayer(roomId, client.id);
        if (!isTurnPlayer) return from([`还没有到出手时机`]).pipe(map(res => ({ event: 'warn', data: res })));

        // 攻击
        this.attack(roomId, client.id, skillId);

        // 检测胜负
        if (this.endFight(roomId)) return empty();

        // 通知下一轮
        const turn = this.turnPlayers(roomId);
        const players = Data.ROOM_CONFIGS[roomId].players;
        this.server.in(roomId).emit(event, {
            turn,
            players,
        });

        return empty();
    }

}
