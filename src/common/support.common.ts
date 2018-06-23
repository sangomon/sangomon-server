import * as lodash from 'lodash';
import * as uuid from 'uuid/v1';

export const _ = lodash;

class SupportCommon {

    public getUuid(option: { simple: boolean } = { simple: false }): string {
        const uuid_str: string = uuid();
        if (option.simple) {
            return uuid_str.replace(/-/g, '');
        }
        return uuid();
    }

    public getId(): string {
        return this.getUuid({ simple: true });
    }
}

export const $ = new SupportCommon();