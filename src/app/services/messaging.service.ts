import { Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsNotification from '../store/notification.actions';
import { AngularFireMessaging } from "@angular/fire/compat/messaging";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFireDatabase } from "@angular/fire/compat/database";
import firebase from "firebase/compat";
import MessagePayload = firebase.messaging.MessagePayload;

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  currentMessage?: BehaviorSubject<MessagePayload>;

  constructor(private store: Store<AppState>, private messaging: AngularFireMessaging, private auth: AngularFireAuth,
              private database: AngularFireDatabase) {
  }

  /**
   * update token in firebase database
   *
   * @param userId userId as a key
   * @param token the new token generated
   */
  updateToken(userId: any, token: string): void {
    this.store.dispatch(
      new fromActionsNotification.NotificationSubscribe(token)
    );
    this.auth.authState.pipe(take(1)).subscribe(
      () => {
        const data = {};
        // @ts-ignore
        data[userId] = token;
        this.database.object('fcmTokens/').update(data);
      });
  }

  /**
   * hook method when new notification received in foreground
   */
  receiveMessage(): void {
    this.messaging.messages.subscribe(payload => {
      if (this.currentMessage) {
        this.currentMessage.next(payload)
      } else {
        this.currentMessage = new BehaviorSubject<any>(payload)
      }
    });
  }

  /**
   * request permission for notification from firebase cloud messaging
   *
   * @param userId userId
   */
  requestPermission(userId: any) {
    this.messaging.requestPermission.subscribe(value => {
      if (value === 'granted') {
        this.messaging.requestToken.subscribe(currentToken => {
          if (currentToken) {
            this.updateToken(userId, currentToken);
          } else {
            console.warn('No registration token available. Request permission to generate one.');
          }
        });
      }
    });
  }
}
