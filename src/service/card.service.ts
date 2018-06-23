import {
    Injectable,
} from '@nestjs/common';
import { Observable, from, empty, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { IType } from '../interface';
import { $, _ } from '../common';

@Injectable()
export class CardService {

    public async getMany() {
        return [
            {
                id: '1',
                name: '劈砍',
                hit: 1,
                catalog: 'axe',
                timeCost: 3,
            },
            {
                id: '2',
                name: '挥剑',
                hit: 1,
                catalog: 'sword',
                timeCost: 2,
            },
        ];
    }

}
