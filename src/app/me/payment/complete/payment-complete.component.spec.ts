import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCompleteComponent } from './payment-complete.component';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from '../../../store/app.states';

describe('PaymentComponent', () => {
  let component: PaymentCompleteComponent;
  let fixture: ComponentFixture<PaymentCompleteComponent>;

  let state$: Subject<any>;
  let queryParams$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    state$ = new Subject<any>();
    queryParams$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj<Store<AppState>>('Store', ['dispatch', 'select']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
      queryParams: queryParams$.asObservable(),
    });

    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [PaymentCompleteComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    state$.complete();
    queryParams$.complete();
  });

  it('should create', () => {
    queryParams$.next({
      paymentId: 'paymentId',
      preferenceId: 'preference_id',
      payerId: 'PayerID',
      token: 'token',
      reason: 'reason',
      orderId: 'orderId',
      orderStatusId: 'orderStatusId',
    });
    expect(component).toBeTruthy();
  });
});
