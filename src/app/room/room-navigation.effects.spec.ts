import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { cleanExpense } from '../store/expense.actions';
import { getOptions } from '../store/payment.actions';
import { cleanRoom, getAllRoomsInfo } from '../store/room.actions';
import { RoomListComponent } from './list/room-list.component';
import { AddServiceComponent } from './me/add-service/add-service.component';
import { RoomCreatePageComponent } from './room-create-page.component';
import { RoomDetailsPageComponent } from './room-details-page.component';
import { RoomMeDetailsPageComponent } from './room-me-details-page.component';
import { RoomNavigationEffects } from './room-navigation.effects';
import { ExpenseListComponent } from './me/expense/list/expense-list.component';
import { ExpenseCreatePageComponent } from './me/expense/expense-create-page.component';
import { ExpenseDetailsPageComponent } from './me/expense/expense-details-page.component';

describe('RoomNavigationEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: RoomNavigationEffects;

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);

    TestBed.configureTestingModule({
      providers: [
        RoomNavigationEffects,
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.inject(RoomNavigationEffects);
  });

  const routerNavigated = (activeComponent: unknown): RouterNavigatedAction<any> =>
    ({
      type: ROUTER_NAVIGATED,
      payload: {
        event: {} as any,
        routerState: {
          activeComponent,
          root: { params: {}, firstChild: undefined, queryParams: {} },
        } as any,
      },
    }) as RouterNavigatedAction<any>;

  it('should clean room state on the list page', async () => {
    actions$.next(routerNavigated(RoomListComponent));

    const result = await firstValueFrom(
      effects.loadRoomListPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanRoom()]);
  });

  it('should load room create page dependencies', async () => {
    actions$.next(routerNavigated(RoomCreatePageComponent));

    const result = await firstValueFrom(
      effects.loadRoomCreatePage$.pipe(take(3), toArray()),
    );

    expect(result).toEqual([cleanRoom(), getOptions(), getAllRoomsInfo()]);
  });

  it('should load room details page dependencies', async () => {
    actions$.next(routerNavigated(RoomDetailsPageComponent));

    const result = await firstValueFrom(
      effects.loadRoomDetailsPage$.pipe(take(3), toArray()),
    );

    expect(result).toEqual([cleanRoom(), getOptions(), getAllRoomsInfo()]);
  });

  it('should load room me details page dependencies', async () => {
    actions$.next(routerNavigated(RoomMeDetailsPageComponent));

    const result = await firstValueFrom(
      effects.loadRoomMeDetailsPage$.pipe(take(3), toArray()),
    );

    expect(result).toEqual([cleanRoom(), getOptions(), getAllRoomsInfo()]);
  });

  it('should clean expense state on expense create page', async () => {
    actions$.next(routerNavigated(ExpenseCreatePageComponent));

    const result = await firstValueFrom(
      effects.loadExpenseCreatePage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanExpense()]);
  });

  it('should clean expense state and load options on expense details page', async () => {
    actions$.next(routerNavigated(ExpenseDetailsPageComponent));

    const result = await firstValueFrom(
      effects.loadExpenseDetailsPage$.pipe(take(2), toArray()),
    );

    expect(result).toEqual([cleanExpense(), getOptions()]);
  });

  it('should clean expense state on expenses list page', async () => {
    actions$.next(routerNavigated(ExpenseListComponent));

    const result = await firstValueFrom(
      effects.loadExpensesPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanExpense()]);
  });

  it('should clean expense state on room services page', async () => {
    actions$.next(routerNavigated(AddServiceComponent));

    const result = await firstValueFrom(
      effects.loadRoomServicesPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanExpense()]);
  });
});
