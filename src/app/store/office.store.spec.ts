import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { OfficeStore } from './office.store';
import { OfficeService } from '../services/office.service';

describe('OfficeStore', () => {
  let store: InstanceType<typeof OfficeStore>;
  let officeServiceSpy: jasmine.SpyObj<OfficeService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    officeServiceSpy = jasmine.createSpyObj<OfficeService>('OfficeService', [
      'getOfficesPage',
      'getAllMyOffices',
      'getOffice',
      'createOffice',
      'updateOffice',
      'deleteOffice',
    ]);

    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateSpy.instant.and.callFake(
      (key: string, params?: Record<string, string>) =>
        `${key}:${params?.['name'] ?? ''}`,
    );

    TestBed.configureTestingModule({
      providers: [
        OfficeStore,
        { provide: OfficeService, useValue: officeServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(OfficeStore);
  });

  it('should load offices page', () => {
    const page = { content: [] } as any;
    officeServiceSpy.getOfficesPage.and.returnValue(of(page));

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

    expect(store.isLoading()).toBeFalse();
  });

  it('should load my offices list', () => {
    const list = [{ id: '1' }] as any;
    officeServiceSpy.getAllMyOffices.and.returnValue(of(list));

    store.loadMyOffices();

    expect(officeServiceSpy.getAllMyOffices).toHaveBeenCalled();

    expect(store.data()).toEqual({
      kind: 'list',
      value: list,
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should load office by id', () => {
    const office = { id: 'o1' } as any;
    officeServiceSpy.getOffice.and.returnValue(of(office));

    store.loadById('o1');

    expect(officeServiceSpy.getOffice).toHaveBeenCalledWith('o1');
    expect(store.selected()).toEqual(office);
    expect(store.isLoading()).toBeFalse();
  });

  it('should create office and set response', () => {
    officeServiceSpy.createOffice.and.returnValue(
      of({ id: '1', name: 'HQ' } as any),
    );

    store.create({ name: 'HQ' } as any);

    expect(officeServiceSpy.createOffice).toHaveBeenCalledWith(
      jasmine.any(Object),
    );

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'OFFICE.CREATED',
      { name: 'HQ' },
    );

    expect(store.response()).toEqual({
      message: 'OFFICE.CREATED:HQ',
      path: 'offices/1',
      redirect: 'offices',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should update office and set response', () => {
    officeServiceSpy.updateOffice.and.returnValue(
      of({ id: '2', name: 'Updated Office' } as any),
    );

    store.update('2', { name: 'Updated Office' } as any);

    expect(officeServiceSpy.updateOffice).toHaveBeenCalledWith(
      '2',
      jasmine.any(Object),
    );

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'OFFICE.UPDATED.MESSAGE',
      { name: 'Updated Office' },
    );

    expect(store.response()).toEqual({
      message: 'OFFICE.UPDATED.MESSAGE:Updated Office',
      path: 'offices/2',
      redirect: 'offices',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should delete office and show warning response', () => {
    officeServiceSpy.deleteOffice.and.returnValue(of(void 0));

    store.delete('o1', 'Main Office');

    expect(officeServiceSpy.deleteOffice).toHaveBeenCalledWith('o1');

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'OFFICE.DELETED.MESSAGE',
      { name: 'Main Office' },
    );

    expect(store.response()).toEqual({
      message: 'OFFICE.DELETED.MESSAGE:Main Office',
      redirect: 'offices',
      reload: true,
      toastType: 'warning',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should map HTTP errors into error state', () => {
    officeServiceSpy.getOffice.and.returnValue(
      throwError(() =>
        new HttpErrorResponse({
          status: 404,
          error: { message: 'OFFICE.NOT_FOUND' },
        }),
      ),
    );

    store.loadById('missing');

    expect(store.error()).toEqual(
      jasmine.objectContaining({
        status: 'NOT_FOUND',
        message: 'OFFICE.NOT_FOUND',
      }),
    );

    expect(store.isLoading()).toBeFalse();
  });

  it('should reset state on clean()', () => {
    officeServiceSpy.getOfficesPage.and.returnValue(of({ content: [] } as any));

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
    officeServiceSpy.getOfficesPage.and.returnValue(of({ content: [] } as any));

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
