import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsNotification from '../store/notification.actions';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import firebase from 'firebase/compat';
import MessagePayload = firebase.messaging.MessagePayload;

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  currentMessage?: BehaviorSubject<MessagePayload>;

  tokenList: AngularFireList<any>;

  constructor(private store: Store<AppState>, private messaging: AngularFireMessaging, private auth: AngularFireAuth,
              private database: AngularFireDatabase) {
    this.tokenList = database.list('/fcmTokens');
  }

  /**
   * update token in firebase database
   *
   * @param user user as a key
   * @param token the new token generated
   */
  updateToken(user: any, token: string): void {
    this.store.dispatch(
      new fromActionsNotification.NotificationSubscribe(token)
    );
    const data = {};
    // @ts-ignore
    data[userId] = token;
    this.tokenList.push(data);
    // this.auth.authState.pipe(take(1)).subscribe(
    //   () => {
    //     const data = {};
    //     // @ts-ignore
    //     data[userId] = token;
    //     this.database.object('fcmTokens/').update(data);
    //   });

    // if (user.provider === 'GOOGLE') {
    //   const provider = new firebase.auth.GoogleAuthProvider();
    //   provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    //   this.auth.signInWithPopup(provider).then(() => {
    //     const data = {};
    //     // @ts-ignore
    //     data[user.id] = token;
    //     this.database.object('fcmTokens/').update(data);
    //   });
    // } else {
    //   this.auth.createUserWithEmailAndPassword(user.email, user.username).then(() => {
    //     const data = {};
    //     // @ts-ignore
    //     data[user.id] = token;
    //     this.database.object('fcmTokens/').update(data);
    //   });
    // }
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
    this.messaging.requestPermission.subscribe(value => {
      console.log('value', value);
      if (value === 'granted') {
        this.messaging.requestToken.subscribe(currentToken => {
          console.log('currentToken', currentToken);
          if (currentToken) {
            this.updateToken(user, currentToken);
          } else {
            console.warn('No registration token available. Request permission to generate one.');
          }
        });
      }
    });
  }
}
