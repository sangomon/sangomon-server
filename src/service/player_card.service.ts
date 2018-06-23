import {
    Injectable,
} from '@nestjs/common';
import { Observable, from, empty, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { IType } from '../interface';
import { $, _ } from '../common';

@Injectable()
export class PlayerCardService {

    public getMany() {
        return [
            {
                id: '1',
                playerId: '1',
                cardId: '1',
            },
            {
                id: '2',
                playerId: '1',
                cardId: '2',
            },
            {
                id: '3',
                playerId: '1',
                cardId: '2',
            },
            {
                id: '4',
                playerId: '1',
                cardId: '2',
            },
        ];
    }

}
