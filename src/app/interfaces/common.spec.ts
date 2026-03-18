import { firstValueFrom, toArray } from 'rxjs';

import { PAGE_SIZE } from './pagination';
import { PageRequest, isString, success, successResponse } from './common';

describe('Common interface helpers', () => {
  it('should create page request with default page size', () => {
    const request = new PageRequest(2, 'name', 'asc');

    expect(request.page).toBe(2);
    expect(request.sort).toBe('name');
    expect(request.direction).toBe('asc');
    expect(request.size).toBe(PAGE_SIZE);
  });

  it('should create page request with explicit page size', () => {
    const request = new PageRequest(1, 'createdAt', 'desc', 25);

    expect(request.size).toBe(25);
  });

  it('should emit main success action and extra actions', async () => {
    const actionCreator = (payload: {
      message: string;
      path?: string;
      reload?: boolean;
      toastType?: string;
      redirect?: string;
    }) => ({ type: '[Test] Success', ...payload });

    const extraAction = {
      type: '[Test] Extra',
      message: 'Side effect',
      path: undefined,
      reload: false,
      toastType: 'success',
      redirect: undefined,
    };
    const result = await firstValueFrom(
      success(actionCreator, 'Saved', '/users', true, 'success', extraAction).pipe(toArray()),
    );

    expect(result).toEqual([
      {
        type: '[Test] Success',
        message: 'Saved',
        path: '/users',
        reload: true,
        toastType: 'success',
        redirect: undefined,
      },
      extraAction,
    ]);
  });

  it('should support explicit redirect with successResponse', async () => {
    const actionCreator = (payload: {
      message: string;
      path?: string;
      reload?: boolean;
      toastType?: string;
      redirect?: string;
    }) => ({ type: '[Test] Redirect', ...payload });

    const result = await firstValueFrom(
      successResponse(actionCreator, 'Continue', '/auth', '/login').pipe(toArray()),
    );

    expect(result).toEqual([
      {
        type: '[Test] Redirect',
        message: 'Continue',
        path: '/auth',
        reload: false,
        toastType: 'success',
        redirect: '/login',
      },
    ]);
  });

  it('should detect strings', () => {
    expect(isString('cleos')).toBeTrue();
    expect(isString(10)).toBeFalse();
    expect(isString({ value: 'x' })).toBeFalse();
  });
});
