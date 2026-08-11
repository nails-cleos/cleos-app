import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AdditionalStore } from './additional.store';
import { AdditionalService } from '../services/additional.service';

describe('AdditionalStore', () => {
  let store: InstanceType<typeof AdditionalStore>;
  let additionalServiceSpy: {
    getAdditionalPage: Mock;
    getAdditionalList: Mock;
    getAllAdditionalByGroupId: Mock;
    getAdditional: Mock;
    createAdditional: Mock;
    updateAdditional: Mock;
    sortAdditional: Mock;
    deleteAdditional: Mock;
  };

  beforeEach(() => {
    additionalServiceSpy = {
      getAdditionalPage: vi
        .fn()
        .mockName('AdditionalService.getAdditionalPage'),
      getAdditionalList: vi
        .fn()
        .mockName('AdditionalService.getAdditionalList'),
      getAllAdditionalByGroupId: vi
        .fn()
        .mockName('AdditionalService.getAllAdditionalByGroupId'),
      getAdditional: vi.fn().mockName('AdditionalService.getAdditional'),
      createAdditional: vi.fn().mockName('AdditionalService.createAdditional'),
      updateAdditional: vi.fn().mockName('AdditionalService.updateAdditional'),
      sortAdditional: vi.fn().mockName('AdditionalService.sortAdditional'),
      deleteAdditional: vi.fn().mockName('AdditionalService.deleteAdditional'),
    };

    TestBed.configureTestingModule({
      providers: [
        AdditionalStore,
        { provide: AdditionalService, useValue: additionalServiceSpy },
      ],
    });

    store = TestBed.inject(AdditionalStore);
  });

  it('should load page and map pagination data', () => {
    const page = { content: [] } as any;
    additionalServiceSpy.getAdditionalPage.mockReturnValue(of(page));

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

    expect(store.isLoading()).toBe(false);
  });

  it('should load list and map list data', () => {
    const list = [{ id: '1' }] as any;
    additionalServiceSpy.getAdditionalList.mockReturnValue(of(list));

    store.loadList();

    expect(additionalServiceSpy.getAdditionalList).toHaveBeenCalled();

    expect(store.data()).toEqual({
      kind: 'list',
      value: list,
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should load all by group id', () => {
    const list = [{ id: '1' }] as any;
    additionalServiceSpy.getAllAdditionalByGroupId.mockReturnValue(of(list));

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
    additionalServiceSpy.getAdditional.mockReturnValue(of(item));

    store.loadById('1');

    expect(additionalServiceSpy.getAdditional).toHaveBeenCalledWith('1');
    expect(store.selected()).toEqual(item);
    expect(store.isLoading()).toBe(false);
  });

  it('should create additional and set response', () => {
    additionalServiceSpy.createAdditional.mockReturnValue(
      of({ id: '1', name: 'Extra' } as any),
    );

    store.create({ name: 'Extra' } as any);

    expect(additionalServiceSpy.createAdditional).toHaveBeenCalledWith(
      expect.any(Object),
    );

    expect(store.response()).toEqual({
      messageKey: 'ADDITIONAL.CREATED',
      messageParams: { name: 'Extra' },
      path: 'additional/1',
      redirect: 'additional',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should update additional and set response', () => {
    additionalServiceSpy.updateAdditional.mockReturnValue(
      of({ id: '2', name: 'Updated' } as any),
    );

    store.update('2', { name: 'Updated' } as any);

    expect(additionalServiceSpy.updateAdditional).toHaveBeenCalledWith(
      '2',
      expect.any(Object),
    );

    expect(store.response()).toEqual({
      messageKey: 'ADDITIONAL.UPDATED.MESSAGE',
      messageParams: { name: 'Updated' },
      path: 'additional/2',
      redirect: 'additional',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should sort additional list and set success response', () => {
    additionalServiceSpy.sortAdditional.mockReturnValue(of(void 0));

    const list = [{ id: '1', order: 1 }] as any;

    store.sort(list);

    expect(additionalServiceSpy.sortAdditional).toHaveBeenCalledWith(list);

    expect(store.response()).toEqual({
      message: 'ADDITIONAL.SORTED.MESSAGE',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should delete additional and show warning toast', () => {
    additionalServiceSpy.deleteAdditional.mockReturnValue(of(void 0));

    store.delete('1', 'Item A');

    expect(additionalServiceSpy.deleteAdditional).toHaveBeenCalledWith('1');

    expect(store.response()).toEqual({
      messageKey: 'ADDITIONAL.DELETED.MESSAGE',
      messageParams: { name: 'Item A' },
      reload: true,
      toastType: 'warning',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should map HTTP errors into error state', () => {
    additionalServiceSpy.getAdditional.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { message: 'NOT_FOUND' },
          }),
      ),
    );

    store.loadById('missing');

    expect(store.error()).toEqual(
      expect.objectContaining({
        status: 'NOT_FOUND',
        message: 'NOT_FOUND',
      }),
    );

    expect(store.isLoading()).toBe(false);
  });

  it('should reset state on clean()', () => {
    additionalServiceSpy.getAdditional.mockReturnValue(of({ id: '1' } as any));

    store.loadById('1');
    store.clean();

    expect(store.data()).toBeUndefined();
    expect(store.selected()).toBeUndefined();
  });

  it('should clear response and error separately', () => {
    additionalServiceSpy.getAdditional.mockReturnValue(of({ id: '1' } as any));

    store.loadById('1');

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});
