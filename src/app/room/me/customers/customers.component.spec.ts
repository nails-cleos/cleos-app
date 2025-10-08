import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomersComponent } from './customers.component';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import * as fromActionsRoom from '../../../store/room.actions';
import { IRoomCustomer } from '../../../interfaces/room';

describe('CustomersComponent', () => {
  let component: CustomersComponent;
  let fixture: ComponentFixture<CustomersComponent>;
  let storeSpy: jasmine.SpyObj<Store<any>>;
  let state$: Subject<any>;
  let routeParams$: Subject<any>;

  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    routeParams$ = new Subject();
    state$ = new Subject();

    storeSpy.select.and.returnValue(state$.asObservable());
    await TestBed.configureTestingModule({
      imports: [CustomersComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: { params: routeParams$.asObservable() } },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => of({ matches: false }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch GetAllCustomersInfo when route param changes', () => {
    fixture.detectChanges();
    routeParams$.next({ id: 'room-1' });

    expect(storeSpy.dispatch).toHaveBeenCalledWith(new fromActionsRoom.GetAllCustomersInfo('room-1'));
  });

  it('should update datasource when customers change', () => {
    fixture.detectChanges();
    const customersMock: IRoomCustomer[] = [
      { customerId: '1', customerName: 'Lucas', days: 3, lastTime: new Date().getTime(), reservationId: '123' },
    ];

    state$.next({ customers: customersMock });

    expect(component.dataSource.data).toEqual(customersMock);
  });

  it('should unsubscribe on destroy', () => {
    const mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    (component as any).subscription = mockSubscription;

    component.ngOnDestroy();

    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });
});
