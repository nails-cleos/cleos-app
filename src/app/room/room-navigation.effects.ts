import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanRoom, getAllRoomsInfo } from '../store/room.actions';
import { cleanExpense } from '../store/expense.actions';
import { getOptions } from '../store/payment.actions';
import { navigation } from '../store/router-navigation.operator';
import { RoomListComponent } from './list/room-list.component';
import { AddServiceComponent } from './me/add-service/add-service.component';
import { CustomersComponent } from './me/customers/customers.component';
import { RoomCreatePageComponent } from './room-create-page.component';
import { RoomDetailsPageComponent } from './room-details-page.component';
import { ExpenseCreatePageComponent } from './me/expense/expense-create-page.component';
import { ExpenseDetailsPageComponent } from './me/expense/expense-details-page.component';
import { RoomMeDetailsPageComponent } from './room-me-details-page.component';
import { ExpenseListComponent } from './me/expense/list/expense-list.component';

@Injectable()
export class RoomNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadRoomListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(RoomListComponent, {
        run: () => [cleanRoom()],
      }),
    ));

  loadRoomCreatePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(RoomCreatePageComponent, {
        run: () => [cleanRoom(), getOptions(), getAllRoomsInfo()],
      }),
    ));

  loadRoomDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(RoomDetailsPageComponent, {
        run: () => [cleanRoom(), getOptions(), getAllRoomsInfo()],
      }),
    ));

  loadRoomMeDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(RoomMeDetailsPageComponent, {
        run: () => [cleanRoom(), getOptions(), getAllRoomsInfo()],
      }),
    ));

  loadExpenseCreatePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ExpenseCreatePageComponent, {
        run: () => [cleanExpense()],
      }),
    ));

  loadExpenseDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ExpenseDetailsPageComponent, {
        run: () => [cleanExpense(), getOptions()],
      }),
    ));

  loadExpensesPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ExpenseListComponent, {
        run: () => [cleanExpense()],
      }),
    ));

  loadRoomServicesPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(AddServiceComponent, {
        run: () => [cleanExpense()],
      }),
    ));

  loadRoomCustomersPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(CustomersComponent, {
        run: () => [],
      }),
    ));
}
