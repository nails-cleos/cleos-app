import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { cleanUser, setUserNavigationParams } from '../store/user.actions';
import { UserListComponent } from './list/user-list.component';
import { OverviewComponent } from './overview/overview.component';
import { UserCreatePageComponent } from './user-create-page.component';
import { UserDetailsPageComponent } from './user-details-page.component';
import { UserNavigationEffects } from './user-navigation.effects';

describe('UserNavigationEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: UserNavigationEffects;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);
    routerSpy = jasmine.createSpyObj('Router', ['currentNavigation']);
    routerSpy.currentNavigation.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        UserNavigationEffects,
        provideMockActions(() => actions$),
        { provide: Router, useValue: routerSpy },
      ],
    });

    effects = TestBed.inject(UserNavigationEffects);
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

  it('should clean user state on the list page', async () => {
    actions$.next(routerNavigated(UserListComponent));

    const result = await firstValueFrom(
      effects.loadUserListPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanUser()]);
  });

  it('should restore role state on the create page', async () => {
    routerSpy.currentNavigation.and.returnValue({
      extras: {
        state: {
          role: 'ROLE_CUSTOMER',
        },
      },
    } as any);

    actions$.next(routerNavigated(UserCreatePageComponent));

    const result = await firstValueFrom(
      effects.loadUserCreatePage$.pipe(take(2), toArray()),
    );

    expect(result).toEqual([
      cleanUser(),
      setUserNavigationParams({ role: 'ROLE_CUSTOMER' as any }),
    ]);
  });

  it('should clean user state on the details page', async () => {
    actions$.next(routerNavigated(UserDetailsPageComponent));

    const result = await firstValueFrom(
      effects.loadUserDetailsPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanUser()]);
  });

  it('should clean user state on the overview page', async () => {
    actions$.next(routerNavigated(OverviewComponent));

    const result = await firstValueFrom(
      effects.loadUserOverviewPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanUser()]);
  });
});
