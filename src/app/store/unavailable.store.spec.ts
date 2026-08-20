import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { UnavailableStore } from './unavailable.store';
import { UnavailableService } from '../services/unavailable.service';

describe('UnavailableStore', () => {
  let store: InstanceType<typeof UnavailableStore>;
  let serviceSpy: {
    getUnavailablePage: Mock;
    getUnavailable: Mock;
    createUnavailable: Mock;
    createBlockAgenda: Mock;
    updateUnavailable: Mock;
    deleteUnavailable: Mock;
  };

  beforeEach(() => {
    serviceSpy = {
      getUnavailablePage: vi
        .fn()
        .mockName('UnavailableService.getUnavailablePage'),
      getUnavailable: vi.fn().mockName('UnavailableService.getUnavailable'),
      createUnavailable: vi
        .fn()
        .mockName('UnavailableService.createUnavailable'),
      createBlockAgenda: vi
        .fn()
        .mockName('UnavailableService.createBlockAgenda'),
      updateUnavailable: vi
        .fn()
        .mockName('UnavailableService.updateUnavailable'),
      deleteUnavailable: vi
        .fn()
        .mockName('UnavailableService.deleteUnavailable'),
    };

    TestBed.configureTestingModule({
      providers: [
        UnavailableStore,
        { provide: UnavailableService, useValue: serviceSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });

    store = TestBed.inject(UnavailableStore);
  });

  it('should load page', () => {
    const page = { content: [] } as any;
    serviceSpy.getUnavailablePage.mockReturnValue(of(page));

    store.loadPage({
      page: 0,
      sort: 'date',
      direction: 'asc',
      size: 10,
    });

    expect(serviceSpy.getUnavailablePage).toHaveBeenCalledWith(
      0,
      'date',
      'asc',
      10,
    );

    expect(store.data()).toEqual(page);
    expect(store.isLoading()).toBe(false);
  });

  it('should load by id', () => {
    const item = { id: 'u1' } as any;
    serviceSpy.getUnavailable.mockReturnValue(of(item));

    store.loadById('u1');

    expect(serviceSpy.getUnavailable).toHaveBeenCalledWith('u1');
    expect(store.selected()).toEqual(item);
    expect(store.isLoading()).toBe(false);
  });

  it('should create unavailable (room admin = dashboard route)', () => {
    const date = new Date();
    serviceSpy.createUnavailable.mockReturnValue(
      of({ id: '1', timestamp: date } as any),
    );

    store.create({} as any, true);

    expect(serviceSpy.createUnavailable).toHaveBeenCalled();

    expect(store.response()).toEqual({
      messageKey: 'UNAVAILABLE.CREATED',
      messageParams: { date },
      path: 'dashboard/events',
      redirect: 'unavailable',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should create unavailable (non admin route)', () => {
    const date = new Date();
    serviceSpy.createUnavailable.mockReturnValue(
      of({ id: '2', timestamp: date } as any),
    );

    store.create({} as any, false);

    expect(store.response()).toEqual({
      messageKey: 'UNAVAILABLE.CREATED',
      messageParams: { date },
      path: 'unavailable/2',
      redirect: 'unavailable',
    });
  });

  it('should create block agenda with correct routing', () => {
    const date = new Date();
    serviceSpy.createBlockAgenda.mockReturnValue(
      of({ id: '3', timestamp: date } as any),
    );

    store.createBlockAgenda({} as any, false);

    expect(store.response()).toEqual({
      messageKey: 'UNAVAILABLE.CREATED',
      messageParams: { date },
      path: 'unavailable/block-agenda/3',
      redirect: 'unavailable',
    });
  });

  it('should update unavailable', () => {
    const date = new Date();
    serviceSpy.updateUnavailable.mockReturnValue(
      of({ id: 'u1', timestamp: date } as any),
    );

    store.update('u1', {} as any, 'unavailable');

    expect(store.response()).toEqual({
      messageKey: 'UNAVAILABLE.UPDATED.MESSAGE',
      messageParams: { date },
      path: 'unavailable/u1',
      redirect: 'unavailable',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should delete unavailable with timezone formatting', () => {
    serviceSpy.deleteUnavailable.mockReturnValue(of(void 0));

    const date = new Date();
    store.delete('u1', date.getTime() / 1000, 'Europe/Amsterdam');

    expect(serviceSpy.deleteUnavailable).toHaveBeenCalledWith('u1');

    expect(store.response()).toEqual({
      messageKey: 'UNAVAILABLE.DELETED.MESSAGE',
      messageParams: { date },
      reload: true,
      toastType: 'warning',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should map HTTP errors', () => {
    serviceSpy.getUnavailable.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { message: 'UNAVAILABLE.ERROR' },
          }),
      ),
    );

    store.loadById('x');

    expect(store.error()).toEqual(
      expect.objectContaining({
        status: 'SERVER_ERROR',
        message: 'COMMON.ERROR.TRY_LATER',
      }),
    );

    expect(store.isLoading()).toBe(false);
  });

  it('should reset store on clean()', () => {
    serviceSpy.getUnavailablePage.mockReturnValue(of({ content: [] } as any));

    store.loadPage({
      page: 0,
      sort: 'date',
      direction: 'asc',
      size: 10,
    });

    store.clean();

    expect(store.data()).toBeUndefined();
    expect(store.selected()).toBeUndefined();
  });

  it('should clear response and error', () => {
    serviceSpy.getUnavailablePage.mockReturnValue(of({ content: [] } as any));

    store.loadPage({
      page: 0,
      sort: 'date',
      direction: 'asc',
      size: 10,
    });

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});
