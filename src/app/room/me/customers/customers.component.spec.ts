import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomersComponent } from './customers.component';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { getAllCustomersInfo } from '../../../store/room.actions';
import { IRoomCustomer } from '../../../interfaces/room';
import { AppState } from '../../../store/app.states';

describe('CustomersComponent', () => {
  let component: CustomersComponent;
  let fixture: ComponentFixture<CustomersComponent>;

  let state$: Subject<any>;
  let params$: Subject<any>;
  let breakpointObserver$: Subject<BreakpointState>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    state$ = new Subject();
    params$ = new Subject();
    breakpointObserver$ = new Subject<BreakpointState>();

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: params$.asObservable(),
    });

    storeSpy.select.and.returnValue(state$.asObservable());
    breakpointObserverSpy.observe.and.returnValue(breakpointObserver$.asObservable());

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
  });

  afterEach(() => {
    state$.complete();
    params$.complete();
    breakpointObserver$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe on destroy', () => {
    const nextSpy = spyOn(component['destroy$'], 'next').and.callThrough();
    const completeSpy = spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should dispatch GetAllCustomersInfo when route param changes', () => {
    fixture.detectChanges();
    params$.next({ id: 'room-1' });

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllCustomersInfo({ id: 'room-1' }));
  });

  it('should update datasource when customers change', () => {
    fixture.detectChanges();
    const customersMock: IRoomCustomer[] = [
      { customerId: '1', customerName: 'Lucas', days: 3, lastTime: new Date().getTime(), reservationId: '123' },
    ];

    state$.next({ customers: customersMock });

    expect(component.dataSource.data).toEqual(customersMock);
  });

  describe('should set pageSize based on breakpoint', () => {
    it('should set pageSize to MOBILE_PAGE_SIZE when breakpoint match', () => {
      fixture.detectChanges();
      breakpointObserver$.next({ matches: true, breakpoints: {} });

      expect(component.pageSize).toBe(5);
    });

    it('should set pageSize to PAGE_SIZE when breakpoint does not match', () => {
      fixture.detectChanges();
      breakpointObserver$.next({ matches: false, breakpoints: {} });

      expect(component.pageSize).toBe(10);
    });
  });
});
