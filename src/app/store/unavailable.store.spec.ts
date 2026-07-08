import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { UnavailableStore } from './unavailable.store';
import { UnavailableService } from '../services/unavailable.service';

describe('UnavailableStore', () => {
  let store: InstanceType<typeof UnavailableStore>;
  let serviceSpy: jasmine.SpyObj<UnavailableService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj<UnavailableService>('UnavailableService', [
      'getUnavailablePage',
      'getUnavailable',
      'createUnavailable',
      'createBlockAgenda',
      'updateUnavailable',
      'deleteUnavailable',
    ]);

    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateSpy.instant.and.callFake(
      (key: string, params?: Record<string, any>) =>
        `${ key }:${ params?.['date'] ?? '' }`,
    );

    TestBed.configureTestingModule({
      providers: [
        UnavailableStore,
        { provide: UnavailableService, useValue: serviceSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(UnavailableStore);
  });

  it('should load page', () => {
    const page = { content: [] } as any;
    serviceSpy.getUnavailablePage.and.returnValue(of(page));

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
    expect(store.isLoading()).toBeFalse();
  });

  it('should load by id', () => {
    const item = { id: 'u1' } as any;
    serviceSpy.getUnavailable.and.returnValue(of(item));

    store.loadById('u1');

    expect(serviceSpy.getUnavailable).toHaveBeenCalledWith('u1');
    expect(store.selected()).toEqual(item);
    expect(store.isLoading()).toBeFalse();
  });

  it('should create unavailable (room admin = dashboard route)', () => {
    const date = new Date();
    serviceSpy.createUnavailable.and.returnValue(
      of({ id: '1', timestamp: date } as any),
    );

    store.create({} as any, true);

    expect(serviceSpy.createUnavailable).toHaveBeenCalled();

    expect(store.response()).toEqual({
      message: `UNAVAILABLE.CREATED:${ date }`,
      path: 'dashboard/events',
      redirect: 'unavailable',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should create unavailable (non admin route)', () => {
    const date = new Date();
    serviceSpy.createUnavailable.and.returnValue(
      of({ id: '2', timestamp: date } as any),
    );

    store.create({} as any, false);

    expect(store.response()).toEqual({
      message: `UNAVAILABLE.CREATED:${ date }`,
      path: 'unavailable/2',
      redirect: 'unavailable',
    });
  });

  it('should create block agenda with correct routing', () => {
    const date = new Date();
    serviceSpy.createBlockAgenda.and.returnValue(
      of({ id: '3', timestamp: date } as any),
    );

    store.createBlockAgenda({} as any, false);

    expect(store.response()).toEqual({
      message: `UNAVAILABLE.CREATED:${ date }`,
      path: 'unavailable/block-agenda/3',
      redirect: 'unavailable',
    });
  });

  it('should update unavailable', () => {
    const date = new Date();
    serviceSpy.updateUnavailable.and.returnValue(
      of({ id: 'u1', timestamp: date } as any),
    );

    store.update('u1', {} as any, 'unavailable');

    expect(store.response()).toEqual({
      message: `UNAVAILABLE.UPDATED.MESSAGE:${ date }`,
      path: 'unavailable/u1',
      redirect: 'unavailable',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should delete unavailable with timezone formatting', () => {
    serviceSpy.deleteUnavailable.and.returnValue(of(void 0));

    const date = new Date();
    store.delete('u1', date.getTime() / 1000, 'Europe/Amsterdam');

    expect(serviceSpy.deleteUnavailable).toHaveBeenCalledWith('u1');

    expect(store.response()).toEqual({
      message: `UNAVAILABLE.DELETED.MESSAGE:${ date }`,
      reload: true,
      toastType: 'warning',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should map HTTP errors', () => {
    serviceSpy.getUnavailable.and.returnValue(
      throwError(() =>
        new HttpErrorResponse({
          status: 500,
          error: { message: 'UNAVAILABLE.ERROR' },
        }),
      ),
    );

    store.loadById('x');

    expect(store.error()).toEqual(
      jasmine.objectContaining({
        status: 'SERVER_ERROR',
        message: 'COMMON.ERROR.TRY_LATER',
      }),
    );

    expect(store.isLoading()).toBeFalse();
  });

  it('should reset store on clean()', () => {
    serviceSpy.getUnavailablePage.and.returnValue(of({ content: [] } as any));

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
    serviceSpy.getUnavailablePage.and.returnValue(of({ content: [] } as any));

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
