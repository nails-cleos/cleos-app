import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MePaymentComponent } from './me-payment.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Analytics } from '@angular/fire/analytics';
import { TranslateModule } from '@ngx-translate/core';

describe('MePaymentComponent', () => {
  let component: MePaymentComponent;
  let fixture: ComponentFixture<MePaymentComponent>;

  const storeSpy = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const activatedRouteSpy = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('calendar'),
      },
    },
    params: of({ id: 'reservation-id' }),
  };

  const mockAnalytics = {
    app: {
      options: {},
    },
  } as Analytics;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MePaymentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Analytics, useValue: mockAnalytics },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
