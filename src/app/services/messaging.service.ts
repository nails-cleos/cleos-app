import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsNotification from '../store/notification.actions';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  currentMessage = new BehaviorSubject(null);

  constructor(private angularFireDB: AngularFireDatabase, private angularFireAuth: AngularFireAuth,
              private angularFireMessaging: AngularFireMessaging, private store: Store<AppState>) {
  }

  listen() {
    this.angularFireMessaging.messages.subscribe((message) => { console.log(message); });
  }

  /**
   * update token in firebase database
   *
   * @param userId userId as a key
   * @param token token as a value
   */
  updateToken(userId: any, token: any): void {
    this.store.dispatch(
      new fromActionsNotification.NotificationSubscribe(token)
    );
    this.angularFireAuth.authState.pipe(take(1)).subscribe(
      () => {
        const data = {};
        // @ts-ignore
        data[userId] = token;
        this.angularFireDB.object('fcmTokens/').update(data);
      });
  }

  /**
   * request permission for notification from firebase cloud messaging
   *
   * @param userId userId
   */
  requestPermission(userId: any): void {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        this.updateToken(userId, token);
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }

  /**
   * hook method when new notification received in foreground
   */
  receiveMessage(): void {
    this.angularFireMessaging.messages.subscribe((payload: any) => this.currentMessage.next(payload));
  }
}
