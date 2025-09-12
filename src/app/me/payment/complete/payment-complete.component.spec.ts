import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCompleteComponent } from './payment-complete.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

describe('PaymentComponent', () => {
  let component: PaymentCompleteComponent;
  let fixture: ComponentFixture<PaymentCompleteComponent>;

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('calendar'),
      },
    },
    queryParams: of({
      paymentId: 'paymentId',
      preferenceId: 'preference_id',
      payerId: 'PayerID',
      token: 'token',
      reason: 'reason',
      orderId: 'orderId',
      orderStatusId: 'orderStatusId',
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCompleteComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
