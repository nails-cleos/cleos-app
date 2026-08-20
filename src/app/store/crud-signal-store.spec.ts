import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { of, Subject, throwError } from 'rxjs';

import { withCrudStoreMethods, withCrudStoreState } from './crud-signal-store';
import { Pagination } from '../interfaces/pagination';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type TestEntity = {
  name: string;
};

type TestData =
  | {
      kind: 'pagination';
      value?: Pagination<TestEntity>;
    }
  | {
      kind: 'list';
      value?: TestEntity[];
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
  loadPage = vi.fn().mockName('loadPage');
  loadById = vi.fn().mockName('loadById');
  create = vi.fn().mockName('create');
  update = vi.fn().mockName('update');
  delete = vi.fn().mockName('delete');
  sort = vi.fn().mockName('sort');
}

const TestCrudStore = signalStore(
  withCrudStoreState<TestEntity, TestData, TestEntity>(),
  withCrudStoreMethods<TestEntity, TestResponse, TestResponse, TestDeleteArgs>(
    () => {
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
          message: `created:${response.name}`,
          path: `items/${response.id}`,
        }),
        updateResponse: (response) => ({
          message: `updated:${response.name}`,
          path: `items/${response.id}`,
        }),
        deleteResponse: (args) => ({
          message: `deleted:${args.name}`,
          reload: true,
          toastType: 'warning',
        }),
        sortResponse: () => ({
          message: 'sorted',
          reload: true,
        }),
      };
    },
  ),
);

describe('crud-signal-store', () => {
  let store: InstanceType<typeof TestCrudStore>;
  let api: TestCrudApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestCrudApi, TestCrudStore],
      teardown: {
        destroyAfterEach: true,
      },
    });

    store = TestBed.inject(TestCrudStore);
    api = TestBed.inject(TestCrudApi);
  });

  it('should keep selected undefined while loadById request is pending', () => {
    const selected$ = new Subject<TestEntity | undefined>();
    api.loadById.mockReturnValue(selected$.asObservable());

    store.loadById('123');

    expect(store.selected()).toBeUndefined();

    selected$.next({ name: 'loaded' });
    selected$.complete();

    expect(store.selected()).toEqual({ name: 'loaded' });
  });

  it('should ignore stale loadPage responses after a newer request starts', () => {
    const firstPage$ = new Subject<Pagination<TestEntity>>();
    const secondPage$ = new Subject<Pagination<TestEntity>>();
    const firstPage = {
      content: [{ name: 'first' }],
      totalElements: 1,
      totalPages: 1,
      number: 0,
    };
    const secondPage = {
      content: [{ name: 'second' }],
      totalElements: 1,
      totalPages: 1,
      number: 1,
    };

    api.loadPage
      .mockReturnValueOnce(firstPage$.asObservable())
      .mockReturnValueOnce(secondPage$.asObservable());

    store.loadPage({ page: 0, sort: 'name', direction: 'asc', size: 10 });
    store.loadPage({ page: 1, sort: 'name', direction: 'asc', size: 10 });

    firstPage$.next(firstPage);
    firstPage$.complete();
    expect(store.data()).toBeUndefined();

    secondPage$.next(secondPage);
    secondPage$.complete();
    expect(store.data()).toEqual({ kind: 'pagination', value: secondPage });
    expect(store.isLoading()).toBe(false);
  });

  it('should ignore stale loadById responses after a newer request starts', () => {
    const firstSelected$ = new Subject<TestEntity | undefined>();
    const secondSelected$ = new Subject<TestEntity | undefined>();

    api.loadById
      .mockReturnValueOnce(firstSelected$.asObservable())
      .mockReturnValueOnce(secondSelected$.asObservable());

    store.loadById('first');
    store.loadById('second');

    firstSelected$.next({ name: 'first' });
    firstSelected$.complete();
    expect(store.selected()).toBeUndefined();

    secondSelected$.next({ name: 'second' });
    secondSelected$.complete();
    expect(store.selected()).toEqual({ name: 'second' });
    expect(store.isLoading()).toBe(false);
  });

  it('should patch response and clear loading on create success', () => {
    api.create.mockReturnValue(of({ id: '1', name: 'Blue' }));

    store.create({ name: 'Blue' });

    expect(store.isLoading()).toBe(false);
    expect(store.response()).toEqual({
      message: 'created:Blue',
      path: 'items/1',
    });
    expect(store.subErrors()).toBeUndefined();
  });

  it('should map http errors into error and subErrors state', () => {
    api.create.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: {
              message: 'VALIDATION.ERROR',
              subErrors: [{ field: 'name', message: 'Name required' }],
            },
          }),
      ),
    );

    store.create({ name: '' });

    expect(store.isLoading()).toBe(false);
    expect(store.error()).toEqual(
      expect.objectContaining({
        message: 'VALIDATION.ERROR',
      }),
    );
    expect(store.subErrors()).toEqual([
      { field: 'name', message: 'Name required' },
    ]);
    expect(store.response()).toBeUndefined();
  });

  it('should reset state with clean and clearError helpers', () => {
    const page: Pagination<TestEntity> = {
      content: [{ name: 'one' }],
      totalElements: 1,
      totalPages: 1,
      number: 0,
    };
    api.loadPage.mockReturnValue(of(page));
    api.create.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: {},
          }),
      ),
    );

    store.loadPage({ page: 0, sort: 'name', direction: 'asc', size: 10 });
    store.create({ name: 'x' });

    expect(store.data()).toEqual({ kind: 'pagination', value: page });
    expect(store.error()).toEqual(
      expect.objectContaining({
        status: 'SERVER_ERROR',
        message: 'COMMON.ERROR.TRY_LATER',
      }),
    );

    store.clearError();
    expect(store.error()).toBeUndefined();
    expect(store.subErrors()).toBeUndefined();

    store.clean();
    expect(store.data()).toBeUndefined();
    expect(store.selected()).toBeUndefined();
    expect(store.response()).toBeUndefined();
    expect(store.isLoading()).toBe(false);
  });

  it('should patch a sort response on sort success', () => {
    const items: TestSortArgs = [{ order: 1, key: 'a' }];
    api.sort.mockReturnValue(of(void 0));

    store.sort(items);

    expect(api.sort).toHaveBeenCalledWith(items);
    expect(store.response()).toEqual({
      message: 'sorted',
      reload: true,
    });
    expect(store.isLoading()).toBe(false);
  });

  it('should patch response on update success', () => {
    api.update.mockReturnValue(of({ id: '1', name: 'Updated' }));

    store.update('1', { name: 'Updated' });

    expect(api.update).toHaveBeenCalledWith('1', { name: 'Updated' });

    expect(store.response()).toEqual({
      message: 'updated:Updated',
      path: 'items/1',
    });

    expect(store.selected()).toBeUndefined();
    expect(store.isLoading()).toBe(false);
  });

  it('should patch response on delete success', () => {
    api.delete.mockReturnValue(of(void 0));

    store.delete({
      id: '1',
      name: 'Blue',
    });

    expect(api.delete).toHaveBeenCalledWith({
      id: '1',
      name: 'Blue',
    });

    expect(store.response()).toEqual({
      message: 'deleted:Blue',
      reload: true,
      toastType: 'warning',
    });

    expect(store.data()).toBeUndefined();
    expect(store.selected()).toBeUndefined();
    expect(store.isLoading()).toBe(false);
  });

  it('should ignore previous create response after a newer create request starts', () => {
    const firstCreate$ = new Subject<TestResponse>();
    const secondCreate$ = new Subject<TestResponse>();

    api.create
      .mockReturnValueOnce(firstCreate$.asObservable())
      .mockReturnValueOnce(secondCreate$.asObservable());

    store.create({ name: 'first' });
    store.create({ name: 'second' });

    firstCreate$.next({
      id: '1',
      name: 'first',
    });
    firstCreate$.complete();

    expect(store.response()).toBeUndefined();

    secondCreate$.next({
      id: '2',
      name: 'second',
    });
    secondCreate$.complete();

    expect(store.response()).toEqual({
      message: 'created:second',
      path: 'items/2',
    });
  });
});
