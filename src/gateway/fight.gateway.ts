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
import { WsAuthGuard } from '../guard/auth.guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway()
export class FightGateway {

    @WebSocketServer() server: Server;

    constructor(
        // private readonly fightService: FightService,
    ) {

    }

    @UseGuards(WsAuthGuard('jwt'))
    @SubscribeMessage('joinRoom')
    async onJoinRoom(client: Socket, data) {
        const me = client.request.user;
        const event = 'joinRoom';
        const roomId = data.roomId;

        client.leaveAll();
        client.join(roomId);

        this.server.in(roomId).emit(event, `玩家${me.id}加入${roomId}房间`);
        return empty();
    }

    @UseGuards(WsAuthGuard('jwt'))
    @SubscribeMessage('leaveRoom')
    async leaveRoom(client: Socket, data) {
        const me = client.request.user;
        const event = 'leaveRoom';
        const roomId = _.keys(client.rooms)[0];

        client.leaveAll();
        client.join(client.id);

        this.server.in(roomId).emit(event, `玩家${me.id}离开${roomId}房间`);
        return empty();
    }

    @UseGuards(WsAuthGuard('jwt'))
    @SubscribeMessage('confirmFight')
    async confirmFight(client: Socket, data) {
        const me = client.request.user;
        const event = 'confirmFight';
        const roomId = _.keys(client.rooms)[0];

        // 战斗的名将, 默认取第一位置
        const playerMon = _.filter(Data.PLAYER_MONS, { playerId: me.id })[0];
        // 确认准备
        Data.ROOM_CONFIG[roomId].playerIds.push(me.id);
        Data.ROOM_CONFIG[roomId].playerMons.push({
            id: playerMon.id,
            playerId: playerMon.playerId,
            monId: playerMon.monId,
            hp: playerMon.hp.current,
        });

        this.server.in(roomId).emit(event, `玩家${me.id}确认比赛`);

        // 等待所有玩家准备
        const playerIds = Data.ROOM_CONFIG[roomId].playerIds;
        if (playerIds.length === 2) {
            const turn = _.shuffle(playerIds);
            // 这次请求后, 完全准备好了
            // 开始初始化比赛配置
            _.merge(Data.ROOM_CONFIG, {
                [roomId]: {
                    turn,
                    maxWaitTime: 30,
                },
            });

            this.server.in(roomId).emit(event, `全部确认完毕, 开始比赛`);
            this.server.in(roomId).emit('useSkill', {
                turn,
                playerMons: Data.ROOM_CONFIG[roomId].playerMons,
            });
        }

        return empty();
    }

    @SubscribeMessage('useSkillStart')
    async useSkillStart(client: Socket, data) {
        const event = 'useSkillStart';
        const roomId = _.keys(client.rooms)[0];

        this.server.in(roomId).emit('useSkill', Data.ROOM_CONFIG[roomId]);
        return empty();
    }

    private checkIsTurnPlayer(roomId: IType.ID, playerId: IType.ID) {
        const turn = Data.ROOM_CONFIG[roomId].turn;
        if (turn[0] === playerId) return true;
        return false;
    }

    private turnPlayers(roomId: IType.ID) {
        const turn = Data.ROOM_CONFIG[roomId].turn;

        const first = turn.shift();
        if (first) turn.push(first);
        Data.ROOM_CONFIG[roomId].turn = turn;
        return turn;
    }

    private attack(roomId: IType.ID, mePlayerId: IType.ID, skillId: number) {
        const isSuccess = _.random(1, skillId) === 1;
        if (isSuccess) {
            const damage = skillId * _.random(1, 10);
            const enemyPlayer = _.reject(Data.ROOM_CONFIG[roomId].playerMons, { playerId: mePlayerId })[0];
            enemyPlayer.hp -= damage;
            this.server.in(roomId).emit('fight', `玩家${mePlayerId}使用${skillId}技能,造成${damage}伤害`);
        } else {
            const damage = skillId + _.random(1, 2);
            const enemyPlayer = _.reject(Data.ROOM_CONFIG[roomId].playerMons, { playerId: mePlayerId })[0];
            enemyPlayer.hp -= damage;
            this.server.in(roomId).emit('fight', `玩家${mePlayerId}力气不足,使用${skillId}技能,造成${damage}伤害`);
        }
    }

    private endFight(roomId: IType.ID) {
        for (const playerMon of Data.ROOM_CONFIG[roomId].playerMons) {
            if (playerMon.hp <= 0) {
                this.server.in(roomId).emit('fightStatus', {
                    winPlayer: _.reject(Data.ROOM_CONFIG[roomId].playerMons, playerMon)[0].playerId,
                    losePlayer: playerMon.playerId,
                });
                delete Data.ROOM_CONFIG[roomId];
                return true;
            }
        }
        return false;
    }

    @UseGuards(WsAuthGuard('jwt'))
    @SubscribeMessage('useSkill')
    async onUseSkill(client: Socket, data) {
        const me = client.request.user;
        const event = 'useSkill';
        const skillId = data.skillId;
        const roomId = _.keys(client.rooms)[0];

        const isTurnPlayer = this.checkIsTurnPlayer(roomId, me.id);
        if (!isTurnPlayer) return from([`还没有到出手时机`]).pipe(map(res => ({ event: 'warn', data: res })));

        // 攻击
        this.attack(roomId, me.id, skillId);

        // 检测胜负
        if (this.endFight(roomId)) return empty();

        // 通知下一轮
        const turn = this.turnPlayers(roomId);
        const playerMons = Data.ROOM_CONFIG[roomId].playerMons;
        this.server.in(roomId).emit(event, {
            turn,
            playerMons,
        });

        return empty();
    }

}
