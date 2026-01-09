import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { subscribeNotification } from '../store/notification.actions';
import { Auth } from '@angular/fire/auth';
import { Database, ref, update } from '@angular/fire/database';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { AppCheck, getToken as getTokenAppCheck } from '@angular/fire/app-check';
import { environment } from '../../environments/environment';
import { NotificationState } from '../store/reducers/notification.reducers';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private readonly injector = inject(Injector);

  private readonly store: Store<NotificationState> = inject(Store<NotificationState>);
  private readonly messaging: Messaging = inject(Messaging);
  private readonly auth: Auth = inject(Auth);
  private readonly database: Database = inject(Database);
  private readonly appCheck: AppCheck = inject(AppCheck);

  message$: Observable<any> = EMPTY;

  /**
   * update token in firebase database
   *
   * @param user user as a key
   * @param token the new token generated
   */
  updateToken = (user: any, token: string): void => {
    if (this.auth.currentUser) {
      this.store.dispatch(subscribeNotification({ token }));
      const data = {};
      // @ts-expect-error assign value in data[user.id]
      data[user.id] = token;
      const collection = ref(this.database, 'fcmTokens/');
      update(collection, data).then(() => console.warn('DB updated'));
    }
  };

  /**
   * hook method when new notification received in foreground
   */
  receiveMessage = (): void => {
    this.message$ = new Observable(sub =>
      runInInjectionContext(this.injector, () => onMessage(this.messaging, it => sub.next(it))),
    );
  };

  /**
   * request permission for notification from firebase cloud messaging
   *
   * @param user user
   */
  requestPermission = (user: any): void => {
    runInInjectionContext(this.injector, () => {
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
                  }),
                );
            }
          });
        }
      });
    });
  };
}
