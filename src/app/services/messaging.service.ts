import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { take } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppState, selectNotificationState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsNotification from '../store/notification.actions';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  currentMessage = new BehaviorSubject(null);

  constructor(private angularFireDB: AngularFireDatabase, private angularFireAuth: AngularFireAuth,
              private angularFireMessaging: AngularFireMessaging, private store: Store<AppState>) {
    this.angularFireMessaging.messages.subscribe(
      // @ts-ignore
      (m: AngularFireMessaging) => {
        m.onMessage = m.onMessage.bind(m);
        m.onTokenRefresh = m.onTokenRefresh.bind(m);
      });
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
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        console.log('new message received. ', payload);
        // @ts-ignore
        this.currentMessage.next(payload);
      });
  }
}
