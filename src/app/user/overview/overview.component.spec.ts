import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewComponent } from './overview.component';
import { BehaviorSubject } from 'rxjs';
import {
  AuthUserService,
  IAuthUser,
  initialAuthUser,
} from '@app/services/auth-user.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { IOverview } from '../user';
import { IReservationOverview } from '@app/reservation/reservation';
import { IChart } from '@app/dashboard/dashboard';
import { signal, WritableSignal } from '@angular/core';
import { UserStore } from '@app/store/user.store';
import { NavigationService } from '@app/services/navigation.service';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { provideTranslateService } from '@ngx-translate/core';
describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let navigationServiceSpy: Pick<
    NavigationService,
    'back' | 'navigate' | 'language' | 'reload'
  > & {
    back: ReturnType<typeof vi.fn>;
    navigate: ReturnType<typeof vi.fn>;
    reload: ReturnType<typeof vi.fn>;
  };

  let overviewSignal: WritableSignal<IOverview | undefined>;
  let errorSignal: WritableSignal<any>;
  let isLoadingSignal: WritableSignal<boolean>;
  let breakpoint$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let userStoreSpy: {
    loadOverview: Mock;
  };
  let breakpointObserverSpy: Pick<BreakpointObserver, 'observe'> & {
    observe: ReturnType<typeof vi.fn>;
  };
  let authUserServiceSpy: Pick<AuthUserService, 'authUser'>;

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      back: vi.fn().mockName('NavigationService.back'),
      reload: vi.fn().mockName('NavigationService.reload'),
      language: DEFAULT_LOCALE,
    };
    overviewSignal = signal<IOverview | undefined>(undefined);
    errorSignal = signal(undefined);
    isLoadingSignal = signal(false);
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    userStoreSpy = {
      loadOverview: vi.fn().mockName('UserStore.loadOverview'),
    };
    Object.assign(userStoreSpy, {
      overview: overviewSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      isLoading: isLoadingSignal.asReadonly(),
      clean: vi.fn().mockName('clean'),
    });
    authUserServiceSpy = {
      authUser: authUserSignal.asReadonly(),
    };
    breakpointObserverSpy = {
      observe: vi.fn().mockName('BreakpointObserver.observe'),
    };
    breakpointObserverSpy.observe.mockReturnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: UserStore, useValue: userStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('should get the layoutSignal when breakpoint does not match', () => {
    breakpoint$.next({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });
    fixture.detectChanges();

    expect(component.layoutSignal()).toEqual({
      columns: 4,
      miniCardInfo: { cols: 2, rows: 2 },
      miniCardAccount: { cols: 1, rows: 1 },
      miniCard: { cols: 1, rows: 1 },
      chart: { cols: 2, rows: 2 },
    });
  });

  it('should get the layoutSignal when breakpoint match', () => {
    breakpoint$.next({
      matches: true,
      breakpoints: {
        [Breakpoints.XSmall]: true,
        [Breakpoints.Small]: true,
      },
    });
    fixture.detectChanges();

    expect(component.layoutSignal()).toEqual({
      columns: 1,
      miniCardInfo: { cols: 1, rows: 2 },
      miniCardAccount: { cols: 1, rows: 1 },
      miniCard: { cols: 1, rows: 1 },
      chart: { cols: 1, rows: 2 },
    });
  });

  it('should set has admin role', () => {
    authUserSignal.update((prev) => ({ ...prev, hasAdminRole: true }));
    fixture.detectChanges();

    expect(component['hasAdminRole']()).toBe(true);
  });

  it('should load overview when userId emits a value', () => {
    userStoreSpy.loadOverview.mockClear();
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    expect(userStoreSpy.loadOverview).toHaveBeenCalledWith('123');
  });

  it('should fill the overview data when overview$ emits a value', () => {
    const miniCardOverview: IReservationOverview[] = [
      {
        title: 'Account Balance',
        primaryValue: '$1000',
        color: 'primary',
        icon: 'account_balance',
      },
    ];
    const chartOverview: IChart[] = [
      {
        title: 'Reservations Over Time',
      },
    ];
    const mockOverview: IOverview = {
      chartOverview,
      miniCardOverview,
      account: {
        customer: {
          displayName: 'User Test',
          id: 'id',
          email: 'user@test.com',
          authorities: [],
          locale: 'en',
          timeZone: 'Europe/Amsterdam',
          image: 'AAA',
        },
        id: 'accountId',
        balance: 0,
        currency: {
          id: 'currencyId',
          code: 'USD',
          icon: '$',
          name: 'US Dollar',
        },
      },
      upcomingList: [1, 2, 3],
    };

    overviewSignal.set(mockOverview);
    fixture.detectChanges();

    expect(component.image).toBe(
      `data:image/jpeg;base64,${mockOverview.account.customer.image}`,
    );
    expect(component.initials).toBe('UT');
    expect(component.upcoming).toEqual([1, 2, 3]);
    expect(component.miniCardData()).toEqual(
      expect.arrayContaining(miniCardOverview),
    );
    expect(component.charts()).toEqual(chartOverview);
    expect(component.customer).toEqual(mockOverview.account.customer);
  });
});
