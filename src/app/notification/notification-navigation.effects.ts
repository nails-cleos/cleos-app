import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanNotification } from '../store/actions/notification.actions';
import { navigation } from '../util/router-navigation.operator';
import { NotificationListComponent } from './list/notification-list.component';

@Injectable()
export class NotificationNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadNotificationListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(NotificationListComponent, {
        run: () => cleanNotification(),
      }),
    ));
}
