import { IType } from './type.interface';

export namespace IData {

    export interface Mon {
        id: IType.ID;
        hp: number;
        name: string;
        attribute: {
            wu: number,
            zhi: number,
            tong: number,
            zheng: number,
            mei: number,
        };
    }

    export interface PlayerMon {
        id: IType.ID;
        playerId: IType.ID;
        monId: IType.ID;
        hp: { current: number, max: number };
        state: {
            isPoisoned: boolean,
        };
    }

    export interface Player {
        id: IType.ID;
        phone: string;
    }

    export interface OnlinePlayer {
        clientId: IType.ID;
        playerId: IType.ID;
    }

    export interface RoomConfig {
        [roomId: string]: {
            turn: IType.ID[],
            playerIds: IType.ID[],
            maxWaitTime: number,
            playerMons: {
                id: IType.ID,
                playerId: IType.ID,
                monId: IType.ID,
                hp: number,
            }[],
        };
    }

}