import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { signal } from '@angular/core';
import { IDashboard } from '../interfaces/dashboard';
import { ICurrencyAll } from '../interfaces/currency';

describe('DashComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  let navigationParams$: BehaviorSubject<any>;
  let dashboardMap$: BehaviorSubject<any>;
  let error$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  const mockMiniCardSummaries = [
    { title: 'currency false', isCurrency: false },
    { title: 'currency true', isCurrency: true },
    { title: 'currency with values', isCurrency: true, value: 23, previousPeriodValue: 20 },
  ];

  const mockChartSummaries = [{ title: 'chart' }];

  const currency: ICurrencyAll = {
    id: '1',
    name: 'Test Currency',
    code: 'EUR',
    icon: 'euro',
  };

  let storeSpy: jasmine.SpyObj<Store<any>>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    navigationParams$ = new BehaviorSubject(undefined);
    dashboardMap$ = new BehaviorSubject(undefined);
    error$ = new BehaviorSubject(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return navigationParams$.asObservable();
        case 2:
          return dashboardMap$.asObservable();
        case 3:
          return error$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    const translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard', () => {
    const roomName = 'Test Room';
    component.getForm.selectedDash.setValue(roomName);
    const record: Record<string, IDashboard> = {};
    record[roomName] = { miniCardSummaries: mockMiniCardSummaries, currency };
    dashboardMap$.next(record);

    fixture.detectChanges();

    expect(component.currency).toBe(currency);

    expect(component.miniCardData.length).toBe(3);
    expect(component.miniCardData[0].isCurrency).toEqual(mockMiniCardSummaries[0].isCurrency);
    expect(component.miniCardData[1].isCurrency).toEqual(mockMiniCardSummaries[1].isCurrency);
    expect(component.miniCardData[2].isCurrency).toEqual(mockMiniCardSummaries[2].isCurrency);
    expect(component.miniCardData[2].value).toEqual('€23.00');
    expect(component.miniCardData[2].previousPeriodValue).toEqual('€20.00');
  });

  it('should load dashboard primary room', () => {
    const roomName = 'Test Room';
    const record: Record<string, IDashboard> = {};
    record[roomName] = { chartSummaries: mockChartSummaries, currency, primary: true };
    dashboardMap$.next(record);

    fixture.detectChanges();

    expect(component.currency).toBe(currency);

    expect(component.charts.length).toBe(1);
    expect(component.charts[0].title).toEqual(mockChartSummaries[0].title);
  });
});
