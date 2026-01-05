import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanNotification } from '../store/notification.actions';

@Injectable()
export class NotificationNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleNotificationNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      concatMap((action: RouterNavigatedAction) => {
        const url = action.payload.routerState.url;

        // 1) /notifications
        const notificationsMatch = url.match(/\/notifications$/);
        if (notificationsMatch) {
          return [cleanNotification()];
        }

        return [];
      }),
    ));
}
