import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { environment } from "../../environments/environment";
import * as fromActionsNotification from '../store/notification.actions';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  currentMessage?: BehaviorSubject<any>;

  constructor(private store: Store<AppState>) {
  }

  /**
   * update token in firebase database
   *
   * @param userId userId as a key
   */
  updateToken(userId: any, token: string): void {
    this.store.dispatch(
      new fromActionsNotification.NotificationSubscribe(token)
    );
    // this.angularFireAuth.authState.pipe(take(1)).subscribe(
    //   () => {
    //     const data = {};
    //     // @ts-ignore
    //     data[userId] = token;
    //     this.angularFireDB.object('fcmTokens/').update(data);
    //   });
  }

  /**
   * hook method when new notification received in foreground
   */
  receiveMessage(): void {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
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
  // requestPermission(userId: any): void {
  // Notification.requestPermission().then((permission) => {
  //   console.log(permission)
  //   if (permission === 'granted') {
  //     this.updateToken(userId);
  //   }
  // });
  // }

  requestPermission(userId: any) {
    const messaging = getMessaging();
    getToken(messaging,
      { vapidKey: environment.firebase.vapidKey }).then(
      (currentToken) => {
        if (currentToken) {
          this.updateToken(userId, currentToken);
        } else {
          console.warn('No registration token available. Request permission to generate one.');
        }
      }).catch((err) => {
      console.error('An error occurred while retrieving token. ', err);
    });
  }
}
