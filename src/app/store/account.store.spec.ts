import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AccountStore } from './account.store';
import { AccountService } from '../services/account.service';

describe('AccountStore', () => {
  let store: InstanceType<typeof AccountStore>;
  let accountServiceSpy: {
    getAccount: Mock;
    getAccountByCustomerId: Mock;
    getTransactionsByAccountId: Mock;
    getTransaction: Mock;
    createTransaction: Mock;
    updateAccount: Mock;
  };

  beforeEach(() => {
    accountServiceSpy = {
      getAccount: vi.fn().mockName('AccountService.getAccount'),
      getAccountByCustomerId: vi
        .fn()
        .mockName('AccountService.getAccountByCustomerId'),
      getTransactionsByAccountId: vi
        .fn()
        .mockName('AccountService.getTransactionsByAccountId'),
      getTransaction: vi.fn().mockName('AccountService.getTransaction'),
      createTransaction: vi.fn().mockName('AccountService.createTransaction'),
      updateAccount: vi.fn().mockName('AccountService.updateAccount'),
    };

    TestBed.configureTestingModule({
      providers: [
        AccountStore,
        { provide: AccountService, useValue: accountServiceSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });

    store = TestBed.inject(AccountStore);

    vi.spyOn(window, 'open').mockReturnValue(undefined as any);
  });

  it('should load account and update selected state', () => {
    const mockAccount = { id: 'acc-1' } as any;
    accountServiceSpy.getAccount.mockReturnValue(of(mockAccount));

    store.loadAccount('acc-1');

    expect(accountServiceSpy.getAccount).toHaveBeenCalledWith('acc-1');
    expect(store.isLoading()).toBe(false);
    expect(store.selected()).toEqual(mockAccount);
  });

  it('should load account by customer id', () => {
    const mockAccount = { id: 'acc-2' } as any;
    accountServiceSpy.getAccountByCustomerId.mockReturnValue(of(mockAccount));

    store.loadAccountByCustomerId('cust-1');

    expect(accountServiceSpy.getAccountByCustomerId).toHaveBeenCalledWith(
      'cust-1',
    );
    expect(store.selected()).toEqual(mockAccount);
  });

  it('should load transactions for account', () => {
    const mockData = { items: [] } as any;
    accountServiceSpy.getTransactionsByAccountId.mockReturnValue(of(mockData));

    store.loadTransactions('acc-1', {
      page: 0,
      size: 10,
      sort: 'date',
      direction: 'asc',
    });

    expect(accountServiceSpy.getTransactionsByAccountId).toHaveBeenCalledWith(
      'acc-1',
      0,
      'date',
      'asc',
      10,
    );

    expect(store.data()).toEqual(mockData);
    expect(store.isLoading()).toBe(false);
  });

  it('should load single transaction', () => {
    const tx = { id: 'tx-1' } as any;
    accountServiceSpy.getTransaction.mockReturnValue(of(tx));

    store.loadTransaction('acc-1', 'tx-1');

    expect(accountServiceSpy.getTransaction).toHaveBeenCalledWith(
      'acc-1',
      'tx-1',
    );
    expect(store.selectedTransaction()).toEqual(tx);
  });

  it('should create transaction without payment link and set response', () => {
    accountServiceSpy.createTransaction.mockReturnValue(
      of({ id: 'tx-1' } as any),
    );

    store.createTransaction('acc-1', { amount: 100 } as any);

    expect(accountServiceSpy.createTransaction).toHaveBeenCalledWith(
      'acc-1',
      expect.any(Object),
    );

    expect(store.response()).toEqual({
      messageKey: 'ACCOUNT.MONEY_ADDED',
      messageParams: { id: 'acc-1' },
      path: 'accounts/acc-1/transactions/tx-1',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should open payment link when createTransaction returns paymentLink', () => {
    accountServiceSpy.createTransaction.mockReturnValue(
      of({ paymentLink: 'https://pay.example.com' } as any),
    );

    store.createTransaction('acc-1', { amount: 100 } as any);

    expect(window.open).toHaveBeenCalledWith(
      'https://pay.example.com',
      '_self',
    );
  });

  it('should update account and set response', () => {
    accountServiceSpy.updateAccount.mockReturnValue(
      of({ id: 'acc-99' } as any),
    );

    store.updateAccount('acc-1', { customerId: 'cust-1' } as any);

    expect(accountServiceSpy.updateAccount).toHaveBeenCalledWith(
      'acc-1',
      expect.any(Object),
    );

    expect(store.response()).toEqual({
      messageKey: 'ACCOUNT.UPDATED',
      messageParams: { id: 'acc-99' },
      path: 'accounts/customers/cust-1',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should map HTTP errors into store error state', () => {
    accountServiceSpy.getAccount.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { message: 'ACCOUNT.NOT_FOUND' },
          }),
      ),
    );

    store.loadAccount('missing');

    expect(store.error()).toEqual(
      expect.objectContaining({
        status: 'NOT_FOUND',
        message: 'ACCOUNT.NOT_FOUND',
      }),
    );

    expect(store.isLoading()).toBe(false);
  });

  it('should clear state using clean()', () => {
    accountServiceSpy.getAccount.mockReturnValue(of({ id: 'acc-1' } as any));

    store.loadAccount('acc-1');
    store.clean();

    expect(store.selected()).toBeUndefined();
    expect(store.data()).toBeUndefined();
    expect(store.selectedTransaction()).toBeUndefined();
  });

  it('should clear response and error separately', () => {
    accountServiceSpy.getAccount.mockReturnValue(of({ id: 'acc-1' } as any));

    store.loadAccount('acc-1');

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});
