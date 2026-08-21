import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { OfficeStore } from './office.store';
import { OfficeService } from '../services/office.service';

describe('OfficeStore', () => {
  let store: InstanceType<typeof OfficeStore>;
  let officeServiceSpy: {
    getOfficesPage: Mock;
    getAllMyOffices: Mock;
    getOffice: Mock;
    createOffice: Mock;
    updateOffice: Mock;
    deleteOffice: Mock;
  };

  beforeEach(() => {
    officeServiceSpy = {
      getOfficesPage: vi.fn().mockName('OfficeService.getOfficesPage'),
      getAllMyOffices: vi.fn().mockName('OfficeService.getAllMyOffices'),
      getOffice: vi.fn().mockName('OfficeService.getOffice'),
      createOffice: vi.fn().mockName('OfficeService.createOffice'),
      updateOffice: vi.fn().mockName('OfficeService.updateOffice'),
      deleteOffice: vi.fn().mockName('OfficeService.deleteOffice'),
    };

    TestBed.configureTestingModule({
      providers: [
        OfficeStore,
        { provide: OfficeService, useValue: officeServiceSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });

    store = TestBed.inject(OfficeStore);
  });

  it('should load offices page', () => {
    const page = { content: [] } as any;
    officeServiceSpy.getOfficesPage.mockReturnValue(of(page));

    store.loadPage({
      page: 0,
      sort: 'name',
      direction: 'asc',
      size: 10,
    });

    expect(officeServiceSpy.getOfficesPage).toHaveBeenCalledWith(
      0,
      'name',
      'asc',
      10,
    );

    expect(store.data()).toEqual({
      kind: 'pagination',
      value: page,
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should load my offices list', () => {
    const list = [{ id: '1' }] as any;
    officeServiceSpy.getAllMyOffices.mockReturnValue(of(list));

    store.loadMyOffices();

    expect(officeServiceSpy.getAllMyOffices).toHaveBeenCalled();

    expect(store.data()).toEqual({
      kind: 'list',
      value: list,
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should load office by id', () => {
    const office = { id: 'o1' } as any;
    officeServiceSpy.getOffice.mockReturnValue(of(office));

    store.loadById('o1');

    expect(officeServiceSpy.getOffice).toHaveBeenCalledWith('o1');
    expect(store.selected()).toEqual(office);
    expect(store.isLoading()).toBe(false);
  });

  it('should create office and set response', () => {
    officeServiceSpy.createOffice.mockReturnValue(
      of({ id: '1', name: 'HQ' } as any),
    );

    store.create({ name: 'HQ' } as any);

    expect(officeServiceSpy.createOffice).toHaveBeenCalledWith(
      expect.any(Object),
    );

    expect(store.response()).toEqual({
      messageKey: 'OFFICE.CREATED',
      messageParams: { name: 'HQ' },
      path: 'offices/1',
      redirect: 'offices',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should update office and set response', () => {
    officeServiceSpy.updateOffice.mockReturnValue(
      of({ id: '2', name: 'Updated Office' } as any),
    );

    store.update('2', { name: 'Updated Office' } as any);

    expect(officeServiceSpy.updateOffice).toHaveBeenCalledWith(
      '2',
      expect.any(Object),
    );

    expect(store.response()).toEqual({
      messageKey: 'OFFICE.UPDATED.MESSAGE',
      messageParams: { name: 'Updated Office' },
      path: 'offices/2',
      redirect: 'offices',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should delete office and show warning response', () => {
    officeServiceSpy.deleteOffice.mockReturnValue(of(void 0));

    store.delete('o1', 'Main Office');

    expect(officeServiceSpy.deleteOffice).toHaveBeenCalledWith('o1');

    expect(store.response()).toEqual({
      messageKey: 'OFFICE.DELETED.MESSAGE',
      messageParams: {
        name: 'Main Office',
      },
      redirect: 'offices',
      reload: true,
      toastType: 'warning',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should map HTTP errors into error state', () => {
    officeServiceSpy.getOffice.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { message: 'OFFICE.NOT_FOUND' },
          }),
      ),
    );

    store.loadById('missing');

    expect(store.error()).toEqual(
      expect.objectContaining({
        status: 'NOT_FOUND',
        message: 'OFFICE.NOT_FOUND',
      }),
    );

    expect(store.isLoading()).toBe(false);
  });

  it('should reset state on clean()', () => {
    officeServiceSpy.getOfficesPage.mockReturnValue(of({ content: [] } as any));

    store.loadPage({
      page: 0,
      sort: 'name',
      direction: 'asc',
      size: 10,
    });

    store.clean();

    expect(store.data()).toBeUndefined();
    expect(store.selected()).toBeUndefined();
  });

  it('should clear response and error', () => {
    officeServiceSpy.getOfficesPage.mockReturnValue(of({ content: [] } as any));

    store.loadPage({
      page: 0,
      sort: 'name',
      direction: 'asc',
      size: 10,
    });

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});
