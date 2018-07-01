import { MonConst } from '../const';
import { _, $ } from './support.common';
import { IData } from '../interface/data.interface';

export class Data {

    private static CORE: {
        ONLINE_PLAYERS: IData.OnlinePlayer[],
        ROOM_CONFIG: IData.RoomConfig,
        PLAYERS: IData.Player[],
        PLAYER_MONS: IData.PlayerMon[],
        MONS: IData.Mon[],
    } = {
            ONLINE_PLAYERS: [],
            ROOM_CONFIG: {},
            PLAYERS: [],
            PLAYER_MONS: [],
            MONS: _.map(MonConst, (mon) => {
                return Object.assign(mon, { id: $.getId() });
            }),
        };

    public static MONS = Data.CORE.MONS;

    public static PLAYER_MONS = Data.CORE.PLAYER_MONS;

    public static PLAYERS = Data.CORE.PLAYERS;

    public static ONLINE_PLAYERS = Data.CORE.ONLINE_PLAYERS;

    public static ROOM_CONFIG = Data.CORE.ROOM_CONFIG;

}