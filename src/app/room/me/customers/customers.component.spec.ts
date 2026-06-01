import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomersComponent } from './customers.component';
import { BehaviorSubject, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { getAllCustomersInfo } from '../../../store/room.actions';
import { IRoomCustomer } from '../../../interfaces/room';
import { ActivatedRoute } from '@angular/router';
import { RoomState } from '../../../store/reducers/room.reducers';

describe('CustomersComponent', () => {
  let component: CustomersComponent;
  let fixture: ComponentFixture<CustomersComponent>;

  let customers$: BehaviorSubject<any>;
  let breakpointObserver$: Subject<BreakpointState>;

  let storeSpy: jasmine.SpyObj<Store<RoomState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    customers$ = new BehaviorSubject<IRoomCustomer[]>([]);
    breakpointObserver$ = new Subject<BreakpointState>();

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    breakpointObserverSpy.observe.and.returnValue(breakpointObserver$.asObservable());

    storeSpy.pipe.and.returnValue(customers$.asObservable());

    await TestBed.configureTestingModule({
      imports: [CustomersComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    customers$.complete();
    breakpointObserver$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch GetAllCustomersInfo when route param changes', () => {
    fixture.componentRef.setInput('id', 'room-1');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllCustomersInfo({ id: 'room-1' }));
  });

  it('should update datasource when customers change', () => {
    const customersMock: IRoomCustomer[] = [
      { customerId: '1', customerName: 'Lucas', days: 3, lastTime: new Date().getTime(), reservationId: '123' },
    ];

    customers$.next(customersMock);
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
