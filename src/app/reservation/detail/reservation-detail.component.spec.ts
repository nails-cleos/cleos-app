import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { ReservationDetailComponent } from './reservation-detail.component';
import { AuthUserService } from '../../services/auth-user.service';

describe('ReservationDetailComponent', () => {
  let component: ReservationDetailComponent;
  let fixture: ComponentFixture<ReservationDetailComponent>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('reservation-123'),
      },
    },
    params: of({ id: 'reservation-123' }),
  };

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockAuthUserService = {
    authUser: of({
      isAdmin: false,
      isManager: false,
      isRoomAdmin: false,
      professionalId: 'professional-123',
      customerId: 'customer-123',
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationDetailComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Store, useValue: mockStore },
        { provide: AuthUserService, useValue: mockAuthUserService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.duration).toBeDefined();
    expect(component.changeState).toEqual([]);
    expect(component.displayedColumns).toEqual(['position', 'professional', 'start', 'treatment', 'state']);
    expect(component.pageSize).toBe(5);
    expect(component.disableUpdateButton).toBeTrue();
  });

  it('should subscribe to auth user service on init', () => {
    fixture.detectChanges();
    expect(component.professionalId).toBe('professional-123');
    expect(component.customerId).toBe('customer-123');
  });

  it('should dispatch clean action on init', () => {
    fixture.detectChanges();
    expect(mockStore.dispatch).toHaveBeenCalled();
  });

  it('should return form payments array', () => {
    expect(component.payments).toBeDefined();
    expect(component.payments.length).toBe(0);
  });

  it('should handle state change', () => {
    component.reservation = { id: 'test-id', state: 'created' } as any;
    expect(() => component.onChangeState('test')).not.toThrow();
  });

  it('should calculate total from payments', () => {
    component.paymentPaid = [
      { transactionAmount: 25.00, status: 'APPROVED' },
      { transactionAmount: 25.00, status: 'APPROVED' },
    ] as any;

    const total = component.total;
    expect(total).toBe(50.00);
  });

  it('should handle empty payment array', () => {
    component.paymentPaid = [];
    const total = component.total;
    expect(total).toBe(0);
  });

  it('should handle timezone display', () => {
    const reservation = { room: { timeZone: 'UTC' } } as any;
    const result = component.showTimeZone(reservation);
    expect(typeof result).toBe('boolean');
  });

  it('should handle undefined reservation in timezone', () => {
    const result = component.showTimeZone(undefined);
    expect(typeof result).toBe('boolean');
  });

  it('should return GMT timezone string', () => {
    component.reservation = { room: { timeZone: 'UTC' } } as any;
    const gmt = component.gmt;
    expect(typeof gmt).toBe('string');
  });

  it('should clean up subscriptions on destroy', () => {
    fixture.detectChanges();
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should handle missing payment data gracefully', () => {
    component.paymentPaid = undefined as any;
    expect(() => component.total).not.toThrow();
  });

  it('should handle undefined reservation gracefully', () => {
    component.reservation = undefined;
    expect(() => component.gmt).not.toThrow();
    expect(() => component.showTimeZone()).not.toThrow();
  });
});
