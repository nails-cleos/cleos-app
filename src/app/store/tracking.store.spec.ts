import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { TrackingStore } from './tracking.store';
import { TrackingService } from '../services/tracking.service';

describe('TrackingStore', () => {
  let store: InstanceType<typeof TrackingStore>;
  let serviceSpy: jasmine.SpyObj<TrackingService>;

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj<TrackingService>('TrackingService', [
      'getTrackingByReservationId',
      'executeTrackingByReservationId',
      'updateTrackingByReservationId',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TrackingStore,
        { provide: TrackingService, useValue: serviceSpy },
      ],
    });

    store = TestBed.inject(TrackingStore);
  });

  it('should get tracking by reservation id', () => {
    const tracking = { id: 't1' } as any;
    serviceSpy.getTrackingByReservationId.and.returnValue(of(tracking));

    store.getByReservationId('r1');

    expect(serviceSpy.getTrackingByReservationId).toHaveBeenCalledWith('r1');
    expect(store.selected()).toEqual(tracking);
    expect(store.isLoading()).toBeFalse();
  });

  it('should execute tracking by reservation id', () => {
    const tracking = { id: 't2', status: 'executed' } as any;
    serviceSpy.executeTrackingByReservationId.and.returnValue(of(tracking));

    store.executeByReservationId('r1');

    expect(serviceSpy.executeTrackingByReservationId).toHaveBeenCalledWith('r1');
    expect(store.selected()).toEqual(tracking);
    expect(store.isLoading()).toBeFalse();
  });

  it('should update tracking by reservation id', () => {
    const tracking = { id: 't3', started: '2026-01-01' } as any;

    serviceSpy.updateTrackingByReservationId.and.returnValue(of(tracking));

    store.updateByReservationId('r1', '2026-01-01', '2026-01-02');

    expect(serviceSpy.updateTrackingByReservationId).toHaveBeenCalledWith(
      'r1',
      '2026-01-01',
      '2026-01-02',
    );

    expect(store.selected()).toEqual(tracking);
    expect(store.isLoading()).toBeFalse();
  });

  it('should handle undefined optional params in update', () => {
    serviceSpy.updateTrackingByReservationId.and.returnValue(
      of({ id: 't4' } as any),
    );

    store.updateByReservationId('r1');

    expect(serviceSpy.updateTrackingByReservationId).toHaveBeenCalledWith(
      'r1',
      undefined,
      undefined,
    );
  });

  it('should map HTTP error into store state', () => {
    serviceSpy.getTrackingByReservationId.and.returnValue(
      throwError(() =>
        new HttpErrorResponse({
          status: 500,
          error: { message: 'TRACKING.ERROR' },
        }),
      ),
    );

    store.getByReservationId('r1');

    expect(store.error()).toEqual(
      jasmine.objectContaining({
        status: 'SERVER_ERROR',
        message: 'COMMON.ERROR.TRY_LATER',
      }),
    );

    expect(store.isLoading()).toBeFalse();
  });

  it('should reset state on clean()', () => {
    serviceSpy.getTrackingByReservationId.and.returnValue(of({ id: 'x' } as any));

    store.getByReservationId('r1');
    store.clean();

    expect(store.selected()).toBeUndefined();
    expect(store.response()).toBeUndefined();
    expect(store.error()).toBeUndefined();
  });

  it('should clear response and error', () => {
    serviceSpy.getTrackingByReservationId.and.returnValue(of({ id: 'x' } as any));

    store.getByReservationId('r1');

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});
