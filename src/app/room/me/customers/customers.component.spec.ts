import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomersComponent } from './customers.component';
import { Subject } from 'rxjs';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { IRoomCustomer } from '../../room';
import { ActivatedRoute } from '@angular/router';
import { RoomStore } from '@app/store/room.store';
import { signal } from '@angular/core';
import { NavigationService } from '@app/services/navigation.service';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { provideTranslateService } from '@ngx-translate/core';

describe('CustomersComponent', () => {
  let component: CustomersComponent;
  let fixture: ComponentFixture<CustomersComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let breakpointObserver$: Subject<BreakpointState>;

  let roomStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    customers: ReturnType<typeof signal<any>>;
    loadCustomers: jasmine.Spy;
  };
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    breakpointObserver$ = new Subject<BreakpointState>();

    roomStoreSpy = {
      isLoading: signal(false),
      customers: signal<IRoomCustomer[]>([]),
      loadCustomers: jasmine.createSpy('loadCustomers'),
    };
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    breakpointObserverSpy.observe.and.returnValue(breakpointObserver$.asObservable());

    await TestBed.configureTestingModule({
      imports: [CustomersComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: RoomStore, useValue: roomStoreSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    breakpointObserver$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customers when route param changes', () => {
    fixture.componentRef.setInput('id', 'room-1');
    fixture.detectChanges();

    expect(roomStoreSpy.loadCustomers).toHaveBeenCalledWith('room-1');
  });

  it('should update datasource when customers change', () => {
    const customersMock: IRoomCustomer[] = [
      { customerId: '1', customerName: 'Lucas', days: 3, lastTime: new Date().getTime(), reservationId: '123' },
    ];

    roomStoreSpy.customers.set(customersMock);
    fixture.detectChanges();

    expect(component.dataSource().data).toEqual(customersMock);
  });

  describe('should set pageSize based on breakpoint', () => {
    it('should set pageSize to MOBILE_PAGE_SIZE when breakpoint match', () => {
      breakpointObserver$.next({ matches: true, breakpoints: {} });
      fixture.detectChanges();

      expect(component.pageSizeSignal()).toBe(5);
    });

    it('should set pageSize to PAGE_SIZE when breakpoint does not match', () => {
      breakpointObserver$.next({ matches: false, breakpoints: {} });
      fixture.detectChanges();

      expect(component.pageSizeSignal()).toBe(10);
    });
  });
});
