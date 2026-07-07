import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { AccountStore } from './account.store';
import { AccountService } from '../services/account.service';

describe('AccountStore', () => {
  let store: InstanceType<typeof AccountStore>;
  let accountServiceSpy: jasmine.SpyObj<AccountService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    accountServiceSpy = jasmine.createSpyObj<AccountService>('AccountService', [
      'getAccount',
      'getAccountByCustomerId',
      'getTransactionsByAccountId',
      'getTransaction',
      'createTransaction',
      'updateAccount',
    ]);

    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateSpy.instant.and.callFake(
      (key: string, params?: Record<string, string>) =>
        `${key}:${params?.['id'] ?? ''}`,
    );

    TestBed.configureTestingModule({
      providers: [
        AccountStore,
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(AccountStore);

    spyOn(window, 'open');
  });

  it('should load account and update selected state', () => {
    const mockAccount = { id: 'acc-1' } as any;
    accountServiceSpy.getAccount.and.returnValue(of(mockAccount));

    store.loadAccount('acc-1');

    expect(accountServiceSpy.getAccount).toHaveBeenCalledWith('acc-1');
    expect(store.isLoading()).toBeFalse();
    expect(store.selected()).toEqual(mockAccount);
  });

  it('should load account by customer id', () => {
    const mockAccount = { id: 'acc-2' } as any;
    accountServiceSpy.getAccountByCustomerId.and.returnValue(of(mockAccount));

    store.loadAccountByCustomerId('cust-1');

    expect(accountServiceSpy.getAccountByCustomerId).toHaveBeenCalledWith('cust-1');
    expect(store.selected()).toEqual(mockAccount);
  });

  it('should load transactions for account', () => {
    const mockData = { items: [] } as any;
    accountServiceSpy.getTransactionsByAccountId.and.returnValue(of(mockData));

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
    expect(store.isLoading()).toBeFalse();
  });

  it('should load single transaction', () => {
    const tx = { id: 'tx-1' } as any;
    accountServiceSpy.getTransaction.and.returnValue(of(tx));

    store.loadTransaction('acc-1', 'tx-1');

    expect(accountServiceSpy.getTransaction).toHaveBeenCalledWith('acc-1', 'tx-1');
    expect(store.selectedTransaction()).toEqual(tx);
  });

  it('should create transaction without payment link and set response', () => {
    accountServiceSpy.createTransaction.and.returnValue(
      of({ id: 'tx-1' } as any),
    );

    store.createTransaction('acc-1', { amount: 100 } as any);

    expect(accountServiceSpy.createTransaction).toHaveBeenCalledWith(
      'acc-1',
      jasmine.any(Object),
    );

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'ACCOUNT.MONEY_ADDED',
      { id: 'acc-1' },
    );

    expect(store.response()).toEqual({
      message: 'ACCOUNT.MONEY_ADDED:acc-1',
      path: 'accounts/acc-1/transactions/tx-1',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should open payment link when createTransaction returns paymentLink', () => {
    accountServiceSpy.createTransaction.and.returnValue(
      of({ paymentLink: 'https://pay.example.com' } as any),
    );

    store.createTransaction('acc-1', { amount: 100 } as any);

    expect(window.open).toHaveBeenCalledWith(
      'https://pay.example.com',
      '_self',
    );
  });

  it('should update account and set response', () => {
    accountServiceSpy.updateAccount.and.returnValue(
      of({ id: 'acc-99' } as any),
    );

    store.updateAccount('acc-1', { customerId: 'cust-1' } as any);

    expect(accountServiceSpy.updateAccount).toHaveBeenCalledWith(
      'acc-1',
      jasmine.any(Object),
    );

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'ACCOUNT.UPDATED',
      { id: 'acc-99' },
    );

    expect(store.response()).toEqual({
      message: 'ACCOUNT.UPDATED:acc-99',
      path: 'accounts/customers/cust-1',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should map HTTP errors into store error state', () => {
    accountServiceSpy.getAccount.and.returnValue(
      throwError(() => new HttpErrorResponse({
        status: 404,
        error: { message: 'ACCOUNT.NOT_FOUND' },
      })),
    );

    store.loadAccount('missing');

    expect(store.error()).toEqual(
      jasmine.objectContaining({
        status: 'NOT_FOUND',
        message: 'ACCOUNT.NOT_FOUND',
      }),
    );

    expect(store.isLoading()).toBeFalse();
  });

  it('should clear state using clean()', () => {
    accountServiceSpy.getAccount.and.returnValue(of({ id: 'acc-1' } as any));

    store.loadAccount('acc-1');
    store.clean();

    expect(store.selected()).toBeUndefined();
    expect(store.data()).toBeUndefined();
    expect(store.selectedTransaction()).toBeUndefined();
  });

  it('should clear response and error separately', () => {
    accountServiceSpy.getAccount.and.returnValue(of({ id: 'acc-1' } as any));

    store.loadAccount('acc-1');

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});
