import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { subscribeNotification } from '../store/notification.actions';
import { NotificationState } from '../store/reducers/notification.reducers';
import { EnvService } from './env.service';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private readonly env: EnvService = inject(EnvService);
  private readonly store: Store<NotificationState> = inject(Store<NotificationState>);
  private readonly firebaseService = inject(FirebaseService);

  message$: Observable<any> = this.firebaseService.onMessageReceived();

  /**
   * update token in firebase database
   *
   * @param user user as a key
   * @param token the new token generated
   */

  updateToken(user: any, token: string) {
    if (this.firebaseService.isAuthenticated()) {
      this.store.dispatch(subscribeNotification({ token }));
      this.firebaseService.updateToken(user.id, token)
        .then(() => console.warn('DB updated'))
        .catch(console.error);
    }
  }

  /**
   * request permission for notification from firebase cloud messaging
   *
   * @param user user
   */
  requestPermission(user: any): void {
    this.firebaseService.appCheckToken.then(appCheckToken => {
      if (!appCheckToken) {
        return;
      }
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          navigator.serviceWorker
            .register(this.env.firebaseMessaging, { type: 'module', scope: '__' })
            .then(serviceWorkerRegistration =>
              this.firebaseService.getMessagingToken(
                { serviceWorkerRegistration, vapidKey: this.env.firebase.vapidKey }))
            .then(token => this.updateToken(user, token))
            .catch(err => console.error(err));
        }
      });
    }).catch(err => console.error(err));
  }
}
