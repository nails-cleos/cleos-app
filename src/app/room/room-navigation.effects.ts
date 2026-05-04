import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanRoom, getAllRoomsInfo, setCurrentRoomId } from '../store/room.actions';
import { cleanExpense, setCurrentExpenseId } from '../store/expense.actions';
import { getOptions } from '../store/payment.actions';

@Injectable()
export class RoomNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleRoomNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;

        // 1) /rooms/add
        const addMatch = url.match(/\/rooms\/add$/);
        if (addMatch) {
          return [cleanRoom(), getOptions(), getAllRoomsInfo()];
        }

        // 2) /rooms/:id
        const detailMatch = url.match(/\/rooms\/([^\/]+)$/);
        if (detailMatch) {
          return [
            cleanRoom(),
            getOptions(),
            setCurrentRoomId({ roomId: detailMatch[1] }),
            getAllRoomsInfo(),
          ];
        }

        // 3) /rooms/me/:id
        const meMatch = url.match(/\/rooms\/me\/([^\/]+)$/);
        if (meMatch) {
          return [
            cleanRoom(),
            getOptions(),
            setCurrentRoomId({ roomId: meMatch[1] }),
            getAllRoomsInfo(),
          ];
        }

        // 4) /rooms
        const viewMatch = url.match(/\/rooms\/?$/);
        if (viewMatch) {
          return [cleanRoom()];
        }

        // 5) /rooms/:id/expenses/add
        const addExpenseMatch = url.match(/\/rooms\/([^\/]+)\/expenses\/add$/);
        if (addExpenseMatch) {
          return [cleanExpense(), setCurrentRoomId({ roomId: addExpenseMatch[1] })];
        }

        // 6) /rooms/:id
        const detailExpenseMatch = url.match(/\/rooms\/([^\/]+)\/expenses\/([^\/]+)$/);
        if (detailExpenseMatch) {
          return [
            cleanExpense(),
            getOptions(),
            setCurrentRoomId({ roomId: detailExpenseMatch[1] }),
            setCurrentExpenseId({ expenseId: detailExpenseMatch[2] }),
          ];
        }

        // 7) /rooms/:id/expenses
        const viewExpenseMatch = url.match(/\/rooms\/([^\/]+)\/expenses\/?$/);
        if (viewExpenseMatch) {
          return [cleanExpense(), setCurrentRoomId({ roomId: viewExpenseMatch[1] })];
        }

        // 8) /rooms/:id/services
        const addServicesMatch = url.match(/\/rooms\/([^\/]+)\/services\/?$/);
        if (addServicesMatch) {
          return [cleanExpense(), setCurrentRoomId({ roomId: addServicesMatch[1] })];
        }

        return [];
      }),
    ));
}
