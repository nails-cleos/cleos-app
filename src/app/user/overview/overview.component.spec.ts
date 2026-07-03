import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewComponent } from './overview.component';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { IOverview } from '../user';
import { IReservationOverview } from '../../reservation/reservation';
import { IChart } from '../../dashboard/dashboard';
import { signal, WritableSignal } from '@angular/core';
import { UserStore } from '../../store/user.store';
import { NavigationService } from '../../services/navigation.service';
import { DEFAULT_LOCALE } from '../../util/dates';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let overviewSignal: WritableSignal<IOverview | undefined>;
  let errorSignal: WritableSignal<any>;
  let isLoadingSignal: WritableSignal<boolean>;
  let breakpoint$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let userStoreSpy: jasmine.SpyObj<InstanceType<typeof UserStore>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService',
      ['navigate', 'back', 'reload'],
      { language: DEFAULT_LOCALE },
    );
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

    userStoreSpy = jasmine.createSpyObj<InstanceType<typeof UserStore>>('UserStore', ['loadOverview']);
    Object.assign(userStoreSpy, {
      overview: overviewSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      isLoading: isLoadingSignal.asReadonly(),
      clean: jasmine.createSpy('clean'),
    });
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['authUser'], {
      authUser: authUserSignal.asReadonly(),
    });
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [OverviewComponent, TranslateModule.forRoot()],
      providers: [
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
    authUserSignal.update(prev => ({ ...prev, hasAdminRole: true }));
    fixture.detectChanges();

    expect(component['hasAdminRole']()).toBe(true);
  });

  it('should load overview when userId emits a value', () => {
    userStoreSpy.loadOverview.calls.reset();
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    expect(userStoreSpy.loadOverview).toHaveBeenCalledWith('123');
  });

  it('should fill the overview data when overview$ emits a value', () => {
    const miniCardOverview: IReservationOverview[] = [{
      title: 'Account Balance',
      primaryValue: '$1000',
      color: 'primary',
      icon: 'account_balance',
    }];
    const chartOverview: IChart[] = [{
      title: 'Reservations Over Time',
    }];
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

    expect(component.image).toBe(`data:image/jpeg;base64,${ mockOverview.account.customer.image }`);
    expect(component.initials).toBe('UT');
    expect(component.upcoming).toEqual([1, 2, 3]);
    expect(component.miniCardData()).toEqual(jasmine.arrayContaining(miniCardOverview));
    expect(component.charts()).toEqual(chartOverview);
    expect(component.customer).toEqual(mockOverview.account.customer);
  });
});
