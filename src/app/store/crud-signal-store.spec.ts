import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { of, Subject, throwError } from 'rxjs';

import { withCrudStoreMethods, withCrudStoreState } from './crud-signal-store';
import { Pagination } from '../interfaces/pagination';

type TestEntity = {
  name: string;
};

type TestResponse = {
  id: string;
  name: string;
};

type TestDeleteArgs = {
  id: string;
  name: string;
};

type TestSortArgs = {
  order: number;
  key: string;
}[];

class TestCrudApi {
  loadPage = jasmine.createSpy('loadPage');
  loadById = jasmine.createSpy('loadById');
  create = jasmine.createSpy('create');
  update = jasmine.createSpy('update');
  delete = jasmine.createSpy('delete');
  sort = jasmine.createSpy('sort');
}

const TestCrudStore = signalStore(
  withCrudStoreState<TestEntity>(),
  withCrudStoreMethods<TestEntity, TestResponse, TestResponse, TestDeleteArgs>(() => {
    const api = inject(TestCrudApi);

    return {
      placeholder: { name: 'placeholder' },
      loadPage: (request) => api.loadPage(request),
      loadById: (id) => api.loadById(id),
      create: (entity) => api.create(entity),
      update: (id, entity) => api.update(id, entity),
      delete: (args) => api.delete(args),
      sort: (items) => api.sort(items),
      createResponse: (response) => ({
        message: `created:${ response.name }`,
        path: `items/${ response.id }`,
      }),
      updateResponse: (response) => ({
        message: `updated:${ response.name }`,
        path: `items/${ response.id }`,
      }),
      deleteResponse: (args) => ({
        message: `deleted:${ args.name }`,
        reload: true,
        toastType: 'warning',
      }),
      sortResponse: () => ({
        message: 'sorted',
        reload: true,
      }),
    };
  }),
);

describe('crud-signal-store', () => {
  let store: InstanceType<typeof TestCrudStore>;
  let api: TestCrudApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestCrudApi,
        TestCrudStore,
      ],
    });

    store = TestBed.inject(TestCrudStore);
    api = TestBed.inject(TestCrudApi);
  });

  it('should keep selected undefined while loadById request is pending', () => {
    const selected$ = new Subject<TestEntity | undefined>();
    api.loadById.and.returnValue(selected$.asObservable());

    store.loadById('123');

    expect(store.selected()).toBeUndefined();

    selected$.next({ name: 'loaded' });
    selected$.complete();

    expect(store.selected()).toEqual({ name: 'loaded' });
  });

  it('should patch response and clear loading on create success', () => {
    api.create.and.returnValue(of({ id: '1', name: 'Blue' }));

    store.create({ name: 'Blue' });

    expect(store.isLoading()).toBeFalse();
    expect(store.response()).toEqual({
      message: 'created:Blue',
      path: 'items/1',
    });
    expect(store.subErrors()).toBeUndefined();
  });

  it('should map http errors into error and subErrors state', () => {
    api.create.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 400,
      error: {
        message: 'VALIDATION.ERROR',
        subErrors: [{ field: 'name', message: 'Name required' }],
      },
    })));

    store.create({ name: '' });

    expect(store.isLoading()).toBeFalse();
    expect(store.error()).toEqual(jasmine.objectContaining({
      message: 'VALIDATION.ERROR',
    }));
    expect(store.subErrors()).toEqual([{ field: 'name', message: 'Name required' }]);
    expect(store.response()).toBeUndefined();
  });

  it('should reset state with clean and clearError helpers', () => {
    const page: Pagination<TestEntity> = {
      content: [{ name: 'one' }],
      totalElements: 1,
      totalPages: 1,
      number: 0,
    };
    api.loadPage.and.returnValue(of(page));
    api.create.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 500,
      error: {},
    })));

    store.loadPage({ page: 0, sort: 'name', direction: 'asc', size: 10 });
    store.create({ name: 'x' });

    expect(store.data()).toEqual(page);
    expect(store.error()).toEqual(jasmine.objectContaining({
      status: 'SERVER_ERROR',
      message: 'COMMON.ERROR.TRY_LATER',
    }));

    store.clearError();
    expect(store.error()).toBeUndefined();
    expect(store.subErrors()).toBeUndefined();

    store.clean();
    expect(store.data()).toBeUndefined();
    expect(store.selected()).toBeUndefined();
    expect(store.response()).toBeUndefined();
    expect(store.isLoading()).toBeFalse();
  });

  it('should patch a sort response on sort success', () => {
    const items: TestSortArgs = [{ order: 1, key: 'a' }];
    api.sort.and.returnValue(of(void 0));

    store.sort(items);

    expect(api.sort).toHaveBeenCalledWith(items);
    expect(store.response()).toEqual({
      message: 'sorted',
      reload: true,
    });
    expect(store.isLoading()).toBeFalse();
  });
});
