import {Injectable} from '@angular/core';

import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }

  connect(): any {
    const socket = new SockJS(environment.wsEndpoint);

    return Stomp.over(socket);
  }
}
