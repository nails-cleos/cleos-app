import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { FirebaseService } from './firebase.service';
import { NotificationStore } from '../store/notification.store';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private readonly env: EnvService = inject(EnvService);
  private readonly notificationStore = inject(NotificationStore);
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
      this.notificationStore.subscribeNotification(token);
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
  async requestPermission(user: any): Promise<void> {
    try {
      const appCheckToken = await this.firebaseService.appCheckToken;
      if (!appCheckToken || typeof Notification === 'undefined') {
        return;
      }

      if (Notification.permission === 'denied') {
        console.warn('Notifications are blocked by the browser settings.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return;
      }

      const serviceWorkerRegistration = await navigator.serviceWorker.register(
        this.env.firebaseMessaging,
        { type: 'module', scope: '__' },
      );
      const token = await this.firebaseService.getMessagingToken({
        serviceWorkerRegistration,
        vapidKey: this.env.firebase.vapidKey,
      });

      this.updateToken(user, token);
    } catch (err: any) {
      if (err?.code === 'messaging/permission-blocked') {
        console.warn('Notifications are blocked by the browser settings.');
        return;
      }
      console.error(err);
    }
  }
}
