import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewComponent } from './overview.component';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { getCustomerOverview } from '../../store/user.actions';
import { IOverview } from '../../interfaces/user';
import { IReservationOverview } from '../../interfaces/reservation';
import { IChart } from '../../interfaces/dashboard';
import { signal } from '@angular/core';
import { UserState } from '../../store/reducers/user.reducers';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  let userId$: BehaviorSubject<any>;
  let overview$: BehaviorSubject<any>;
  let error$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<UserState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    userId$ = new BehaviorSubject(undefined);
    overview$ = new BehaviorSubject(undefined);
    error$ = new BehaviorSubject(undefined);
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    storeSpy = jasmine.createSpyObj<Store<UserState>>('Store', ['pipe', 'dispatch']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['authUser'], {
      authUser: authUserSignal.asReadonly(),
    });
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return userId$.asObservable();
        case 2:
          return overview$.asObservable();
        case 3:
          return error$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [OverviewComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Store, useValue: storeSpy },
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

  it('should dispatch getCustomerOverview when userId emits a value', () => {
    // reset calls
    storeSpy.dispatch.calls.reset();

    // emit an id (simulate edit mode)
    userId$.next('123');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getCustomerOverview({ id: '123' }));
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
          imageUrl: 'http://example.com/image.jpg',
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

    overview$.next(mockOverview);
    fixture.detectChanges();

    expect(component.image).toBe('http://example.com/image.jpg');
    expect(component.initials).toBe('UT');
    expect(component.upcoming).toEqual([1, 2, 3]);
    expect(component.miniCardData).toEqual(miniCardOverview);
    expect(component.charts).toEqual(chartOverview);
    expect(component.customer).toEqual(mockOverview.account.customer);
  });
});
