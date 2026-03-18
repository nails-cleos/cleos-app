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

  let roomId$: BehaviorSubject<any>;
  let customers$: BehaviorSubject<any>;
  let breakpointObserver$: Subject<BreakpointState>;

  let storeSpy: jasmine.SpyObj<Store<RoomState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    roomId$ = new BehaviorSubject(undefined);
    customers$ = new BehaviorSubject(undefined);
    breakpointObserver$ = new Subject<BreakpointState>();

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    breakpointObserverSpy.observe.and.returnValue(breakpointObserver$.asObservable());

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return roomId$.asObservable();
        case 2:
          return customers$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [CustomersComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    customers$.complete();
    roomId$.complete();
    breakpointObserver$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch GetAllCustomersInfo when route param changes', () => {
    roomId$.next('room-1');
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
