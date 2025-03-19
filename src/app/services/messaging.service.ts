import { inject, Injectable, Optional } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsNotification from '../store/notification.actions';
import { Auth } from '@angular/fire/auth';
import { Database, ref, update } from '@angular/fire/database';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { AppCheck, getToken as getTokenAppCheck } from '@angular/fire/app-check';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private store: Store<AppState> = inject(Store<AppState>);
  @Optional() private messaging: Messaging = inject(Messaging);
  @Optional() private auth: Auth = inject(Auth);
  private database: Database = inject(Database);
  private appCheck: AppCheck = inject(AppCheck);

  message$: Observable<any> = EMPTY;

  /**
   * update token in firebase database
   *
   * @param user user as a key
   * @param token the new token generated
   */
  updateToken = (user: any, token: string): void => {
    if (this.auth.currentUser) {
      this.store.dispatch(
        new fromActionsNotification.NotificationSubscribe(token)
      );
      const data = {};
      // @ts-ignore
      data[user.id] = token;
      const collection = ref(this.database, 'fcmTokens/');
      update(collection, data).then(() => console.info("DB updated"));
    }
  }

  /**
   * hook method when new notification received in foreground
   */
  receiveMessage = (): void => {
    this.message$ = new Observable(sub => onMessage(this.messaging, it => sub.next(it)));
  }

  /**
   * request permission for notification from firebase cloud messaging
   *
   * @param user user
   */
  requestPermission = (user: any): void => {
    getTokenAppCheck(this.appCheck).then(appCheckToken => {
      if (appCheckToken) {
        Notification.requestPermission().then(value => {
          if (value === 'granted') {
            navigator.serviceWorker.register(environment.firebaseMessaging, { type: 'module', scope: '__' })
              .then(serviceWorkerRegistration =>
                getToken(this.messaging, {
                  serviceWorkerRegistration,
                  vapidKey: environment.firebase.vapidKey,
                }).then(token => {
                  this.updateToken(user, token);
                })
              );
          }
        });
      }
    });
  }
}
