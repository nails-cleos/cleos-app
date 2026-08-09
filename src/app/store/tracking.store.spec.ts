import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { TrackingStore } from './tracking.store';
import { TrackingService } from '../services/tracking.service';

describe('TrackingStore', () => {
  let store: InstanceType<typeof TrackingStore>;
  let serviceSpy: {
    getTrackingByReservationId: Mock;
    executeTrackingByReservationId: Mock;
    updateTrackingByReservationId: Mock;
  };

  beforeEach(() => {
    serviceSpy = {
      getTrackingByReservationId: vi
        .fn()
        .mockName('TrackingService.getTrackingByReservationId'),
      executeTrackingByReservationId: vi
        .fn()
        .mockName('TrackingService.executeTrackingByReservationId'),
      updateTrackingByReservationId: vi
        .fn()
        .mockName('TrackingService.updateTrackingByReservationId'),
    };

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
    serviceSpy.getTrackingByReservationId.mockReturnValue(of(tracking));

    store.getByReservationId('r1');

    expect(serviceSpy.getTrackingByReservationId).toHaveBeenCalledWith('r1');
    expect(store.selected()).toEqual(tracking);
    expect(store.isLoading()).toBe(false);
  });

  it('should execute tracking by reservation id', () => {
    const tracking = { id: 't2', status: 'executed' } as any;
    serviceSpy.executeTrackingByReservationId.mockReturnValue(of(tracking));

    store.executeByReservationId('r1');

    expect(serviceSpy.executeTrackingByReservationId).toHaveBeenCalledWith(
      'r1',
    );
    expect(store.selected()).toEqual(tracking);
    expect(store.isLoading()).toBe(false);
  });

  it('should update tracking by reservation id', () => {
    const tracking = { id: 't3', started: '2026-01-01' } as any;

    serviceSpy.updateTrackingByReservationId.mockReturnValue(of(tracking));

    store.updateByReservationId('r1', '2026-01-01', '2026-01-02');

    expect(serviceSpy.updateTrackingByReservationId).toHaveBeenCalledWith(
      'r1',
      '2026-01-01',
      '2026-01-02',
    );

    expect(store.selected()).toEqual(tracking);
    expect(store.isLoading()).toBe(false);
  });

  it('should handle undefined optional params in update', () => {
    serviceSpy.updateTrackingByReservationId.mockReturnValue(
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
    serviceSpy.getTrackingByReservationId.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { message: 'TRACKING.ERROR' },
          }),
      ),
    );

    store.getByReservationId('r1');

    expect(store.error()).toEqual(
      expect.objectContaining({
        status: 'SERVER_ERROR',
        message: 'COMMON.ERROR.TRY_LATER',
      }),
    );

    expect(store.isLoading()).toBe(false);
  });

  it('should reset state on clean()', () => {
    serviceSpy.getTrackingByReservationId.mockReturnValue(
      of({ id: 'x' } as any),
    );

    store.getByReservationId('r1');
    store.clean();

    expect(store.selected()).toBeUndefined();
    expect(store.response()).toBeUndefined();
    expect(store.error()).toBeUndefined();
  });

  it('should clear response and error', () => {
    serviceSpy.getTrackingByReservationId.mockReturnValue(
      of({ id: 'x' } as any),
    );

    store.getByReservationId('r1');

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});
