import {
    Injectable,
} from '@nestjs/common';
import { Observable, from, empty, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { IType } from '../interface';
import { $, _ } from '../common';

@Injectable()
export class PlayerService {

    public getMany() {
        return [{
            id: '1',
            level: 2,
        }];
    }

}
