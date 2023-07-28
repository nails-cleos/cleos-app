import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsNotification from '../store/notification.actions';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import firebase from 'firebase/compat';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import MessagePayload = firebase.messaging.MessagePayload;

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  currentMessage?: BehaviorSubject<MessagePayload>;

  constructor(private store: Store<AppState>, private messaging: AngularFireMessaging, private auth: AngularFireAuth,
              private database: AngularFireDatabase, private recaptchaV3Service: ReCaptchaV3Service) {
  }

  /**
   * update token in firebase database
   *
   * @param user user as a key
   * @param token the new token generated
   */
  updateToken(user: any, token: string): void {
    this.recaptchaV3Service.execute('importantAction').subscribe((tokenV3) => {
      if (tokenV3) {
        this.auth.onAuthStateChanged(authUser => {
          this.store.dispatch(
            new fromActionsNotification.NotificationSubscribe(token)
          );
          const data = {};
          // @ts-ignore
          data[user.id] = token;
          this.database.object('fcmTokens/').update(data);
        });
      }
    });
  }

  /**
   * hook method when new notification received in foreground
   */
  receiveMessage(): void {
    this.messaging.messages.subscribe(payload => {
      if (this.currentMessage) {
        this.currentMessage.next(payload);
      } else {
        this.currentMessage = new BehaviorSubject<any>(payload);
      }
    });
  }

  /**
   * request permission for notification from firebase cloud messaging
   *
   * @param user user
   */
  requestPermission(user: any): void {
    this.recaptchaV3Service.execute('importantAction').subscribe((tokenV3) => {
      if (tokenV3) {
        this.messaging.requestPermission.subscribe(value => {
          if (value === 'granted') {
            this.messaging.requestToken.subscribe(currentToken => {
              if (currentToken) {
                this.updateToken(user, currentToken);
              } else {
                console.warn('No registration token available. Request permission to generate one.');
              }
            });
          }
        });
      }
    });
  }
}
