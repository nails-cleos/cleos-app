import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { AdditionalStore } from './additional.store';
import { AdditionalService } from '../services/additional.service';

describe('AdditionalStore', () => {
  let store: InstanceType<typeof AdditionalStore>;
  let additionalServiceSpy: jasmine.SpyObj<AdditionalService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    additionalServiceSpy = jasmine.createSpyObj<AdditionalService>('AdditionalService', [
      'getAdditionalPage',
      'getAdditionalList',
      'getAllAdditionalByGroupId',
      'getAdditional',
      'createAdditional',
      'updateAdditional',
      'sortAdditional',
      'deleteAdditional',
    ]);

    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateSpy.instant.and.callFake(
      (key: string, params?: Record<string, string>) =>
        `${key}:${params?.['name'] ?? ''}`,
    );

    TestBed.configureTestingModule({
      providers: [
        AdditionalStore,
        { provide: AdditionalService, useValue: additionalServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(AdditionalStore);
  });

  it('should load page and map pagination data', () => {
    const page = { content: [] } as any;
    additionalServiceSpy.getAdditionalPage.and.returnValue(of(page));

    store.loadPage({
      sort: 'name',
      direction: 'asc',
      page: 0,
      size: 10,
    });

    expect(additionalServiceSpy.getAdditionalPage).toHaveBeenCalledWith(
      'name',
      'asc',
      0,
      10,
    );

    expect(store.data()).toEqual({
      kind: 'pagination',
      value: page,
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should load list and map list data', () => {
    const list = [{ id: '1' }] as any;
    additionalServiceSpy.getAdditionalList.and.returnValue(of(list));

    store.loadList();

    expect(additionalServiceSpy.getAdditionalList).toHaveBeenCalled();

    expect(store.data()).toEqual({
      kind: 'list',
      value: list,
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should load all by group id', () => {
    const list = [{ id: '1' }] as any;
    additionalServiceSpy.getAllAdditionalByGroupId.and.returnValue(of(list));

    store.loadAllByGroupId('room-1', 'group-1');

    expect(additionalServiceSpy.getAllAdditionalByGroupId).toHaveBeenCalledWith(
      'room-1',
      'group-1',
    );

    expect(store.data()).toEqual({
      kind: 'list',
      value: list,
    });
  });

  it('should load entity by id', () => {
    const item = { id: '1' } as any;
    additionalServiceSpy.getAdditional.and.returnValue(of(item));

    store.loadById('1');

    expect(additionalServiceSpy.getAdditional).toHaveBeenCalledWith('1');
    expect(store.selected()).toEqual(item);
    expect(store.isLoading()).toBeFalse();
  });

  it('should create additional and set response', () => {
    additionalServiceSpy.createAdditional.and.returnValue(
      of({ id: '1', name: 'Extra' } as any),
    );

    store.create({ name: 'Extra' } as any);

    expect(additionalServiceSpy.createAdditional).toHaveBeenCalledWith(
      jasmine.any(Object),
    );

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'ADDITIONAL.CREATED',
      { name: 'Extra' },
    );

    expect(store.response()).toEqual({
      message: 'ADDITIONAL.CREATED:Extra',
      path: 'additional/1',
      redirect: 'additional',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should update additional and set response', () => {
    additionalServiceSpy.updateAdditional.and.returnValue(
      of({ id: '2', name: 'Updated' } as any),
    );

    store.update('2', { name: 'Updated' } as any);

    expect(additionalServiceSpy.updateAdditional).toHaveBeenCalledWith(
      '2',
      jasmine.any(Object),
    );

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'ADDITIONAL.UPDATED.MESSAGE',
      { name: 'Updated' },
    );

    expect(store.response()).toEqual({
      message: 'ADDITIONAL.UPDATED.MESSAGE:Updated',
      path: 'additional/2',
      redirect: 'additional',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should sort additional list and set success response', () => {
    additionalServiceSpy.sortAdditional.and.returnValue(of(void 0));

    const list = [{ id: '1', order: 1 }] as any;

    store.sort(list);

    expect(additionalServiceSpy.sortAdditional).toHaveBeenCalledWith(list);

    expect(store.response()).toEqual({
      message: 'ADDITIONAL.SORTED.MESSAGE',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should delete additional and show warning toast', () => {
    additionalServiceSpy.deleteAdditional.and.returnValue(of(void 0));

    store.delete('1', 'Item A');

    expect(additionalServiceSpy.deleteAdditional).toHaveBeenCalledWith('1');

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'ADDITIONAL.DELETED.MESSAGE',
      { name: 'Item A' },
    );

    expect(store.response()).toEqual({
      message: 'ADDITIONAL.DELETED.MESSAGE:Item A',
      reload: true,
      toastType: 'warning',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should map HTTP errors into error state', () => {
    additionalServiceSpy.getAdditional.and.returnValue(
      throwError(() =>
        new HttpErrorResponse({
          status: 404,
          error: { message: 'NOT_FOUND' },
        }),
      ),
    );

    store.loadById('missing');

    expect(store.error()).toEqual(
      jasmine.objectContaining({
        status: 'NOT_FOUND',
        message: 'NOT_FOUND',
      }),
    );

    expect(store.isLoading()).toBeFalse();
  });

  it('should reset state on clean()', () => {
    additionalServiceSpy.getAdditional.and.returnValue(
      of({ id: '1' } as any),
    );

    store.loadById('1');
    store.clean();

    expect(store.data()).toBeUndefined();
    expect(store.selected()).toBeUndefined();
  });

  it('should clear response and error separately', () => {
    additionalServiceSpy.getAdditional.and.returnValue(
      of({ id: '1' } as any),
    );

    store.loadById('1');

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});
