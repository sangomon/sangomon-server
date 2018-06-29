import { IType } from '../interface';

interface CORE {
    ACCOUNTS: {
        id: IType.ID,
        phone: string,
    }[];
    PLAYERS: { clientId: IType.ID, phone: string }[];
    ROOM_CONFIGS: {
        [roomId: string]: {
            turn: IType.ID[],
            playerIds: IType.ID[],
            maxWaitTime: number,
            players: {
                id: IType.ID,
                hp: number,
            }[],
        },
    };
}

export class Data {

    private static CORE: CORE = {
        PLAYERS: [],
        ROOM_CONFIGS: {},
        ACCOUNTS: [],
    };

    public static ACCOUNTS = Data.CORE.ACCOUNTS;

    public static PLAYERS = Data.CORE.PLAYERS;

    public static ROOM_CONFIGS = Data.CORE.ROOM_CONFIGS;

}