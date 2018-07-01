import { Catch, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException)
export class AnyExceptionFilter implements WsExceptionFilter {

    catch(exception: WsException, client) {
        console.log(exception);
        client.emit('exception', {
            status: 'error',
            message: `It's a message from the exception filter`,
        });
    }

}
