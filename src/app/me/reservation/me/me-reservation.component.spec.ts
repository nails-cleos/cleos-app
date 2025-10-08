import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeReservationComponent } from './me-reservation.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Analytics } from '@angular/fire/analytics';
import { AuthUserService } from '../../../services/auth-user.service';

describe('MeReservationComponent', () => {
  let component: MeReservationComponent;
  let fixture: ComponentFixture<MeReservationComponent>;

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
    params: of({ id: 'reservation-id' }),
  };

  const mockAnalytics = {
    app: {
      options: {},
    },
  } as Analytics;

  const mockAuthUserService = {
    authUser: of({
      customerId: 'test-customer-id',
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeReservationComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Analytics, useValue: mockAnalytics },
        { provide: AuthUserService, useValue: mockAuthUserService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
