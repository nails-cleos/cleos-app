import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ExpenseStore } from './expense.store';
import { ExpenseService } from '../services/expense.service';

describe('ExpenseStore', () => {
  let store: InstanceType<typeof ExpenseStore>;
  let expenseServiceSpy: {
    getExpensesPage: Mock;
    getAllExpensesInfo: Mock;
    getExpense: Mock;
    createExpense: Mock;
    updateExpense: Mock;
    deleteExpense: Mock;
  };

  beforeEach(() => {
    expenseServiceSpy = {
      getExpensesPage: vi.fn().mockName('ExpenseService.getExpensesPage'),
      getAllExpensesInfo: vi.fn().mockName('ExpenseService.getAllExpensesInfo'),
      getExpense: vi.fn().mockName('ExpenseService.getExpense'),
      createExpense: vi.fn().mockName('ExpenseService.createExpense'),
      updateExpense: vi.fn().mockName('ExpenseService.updateExpense'),
      deleteExpense: vi.fn().mockName('ExpenseService.deleteExpense'),
    };

    TestBed.configureTestingModule({
      providers: [
        ExpenseStore,
        { provide: ExpenseService, useValue: expenseServiceSpy },
      ],
    });

    store = TestBed.inject(ExpenseStore);
  });

  it('should load expense page and set data', () => {
    const page = { content: [] } as any;
    expenseServiceSpy.getExpensesPage.mockReturnValue(of(page));

    store.loadPage({
      roomId: 'room-1',
      sort: 'date',
      direction: 'desc',
      page: 0,
      size: 10,
      filter: 'food',
      dateFilter: '2026-01',
    });

    expect(expenseServiceSpy.getExpensesPage).toHaveBeenCalledWith(
      'room-1',
      'date',
      'desc',
      0,
      10,
      'food',
      '2026-01',
    );

    expect(store.data()).toEqual(page);
    expect(store.isLoading()).toBe(false);
  });

  it('should load expense info', () => {
    const info = { total: 100 } as any;
    expenseServiceSpy.getAllExpensesInfo.mockReturnValue(of(info));

    store.loadInfo('room-1');

    expect(expenseServiceSpy.getAllExpensesInfo).toHaveBeenCalledWith('room-1');
    expect(store.info()).toEqual(info);
    expect(store.isLoading()).toBe(false);
  });

  it('should load expense by id', () => {
    const expense = { id: 'e1' } as any;
    expenseServiceSpy.getExpense.mockReturnValue(of(expense));

    store.loadById('room-1', 'e1');

    expect(expenseServiceSpy.getExpense).toHaveBeenCalledWith('room-1', 'e1');
    expect(store.selected()).toEqual(expense);
    expect(store.isLoading()).toBe(false);
  });

  it('should create expense and set response', () => {
    expenseServiceSpy.createExpense.mockReturnValue(
      of({ id: '1', name: 'Invoice-1' } as any),
    );

    const file = new File([''], 'invoice.pdf');

    store.create('room-1', { amount: 50 } as any, file);

    expect(expenseServiceSpy.createExpense).toHaveBeenCalledWith(
      'room-1',
      expect.any(Object),
      file,
    );

    expect(store.response()).toEqual({
      messageKey: 'EXPENSE.CREATED',
      messageParams: { invoice: 'Invoice-1' },
      path: 'rooms/room-1/expenses/1',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should update expense and set response', () => {
    expenseServiceSpy.updateExpense.mockReturnValue(
      of({ id: '2', name: 'Updated-Inv' } as any),
    );

    const file = new File([''], 'updated.pdf');

    store.update('2', 'room-1', { amount: 70 } as any, file);

    expect(expenseServiceSpy.updateExpense).toHaveBeenCalledWith(
      '2',
      'room-1',
      expect.any(Object),
      file,
    );

    expect(store.response()).toEqual({
      messageKey: 'EXPENSE.UPDATED.MESSAGE',
      messageParams: { invoice: 'Updated-Inv' },
      path: 'rooms/room-1/expenses/2',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should delete expense and show warning toast', () => {
    expenseServiceSpy.deleteExpense.mockReturnValue(of(void 0));

    store.delete('room-1', 'e1', 'INV-001');

    expect(expenseServiceSpy.deleteExpense).toHaveBeenCalledWith(
      'room-1',
      'e1',
    );

    expect(store.response()).toEqual({
      messageKey: 'EXPENSE.DELETED.MESSAGE',
      messageParams: { invoice: 'INV-001' },
      reload: true,
      toastType: 'warning',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should map HTTP errors into error state', () => {
    expenseServiceSpy.getExpense.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { message: 'EXPENSE.ERROR' },
          }),
      ),
    );

    store.loadById('room-1', 'missing');

    expect(store.error()).toEqual(
      expect.objectContaining({
        message: 'EXPENSE.ERROR',
      }),
    );

    expect(store.isLoading()).toBe(false);
  });

  it('should reset state on clean()', () => {
    expenseServiceSpy.getExpensesPage.mockReturnValue(
      of({ content: [] } as any),
    );

    store.loadPage({
      roomId: 'room-1',
      sort: 'date',
      direction: 'asc',
      page: 0,
      size: 10,
    });

    store.clean();

    expect(store.data()).toBeUndefined();
    expect(store.info()).toBeUndefined();
    expect(store.selected()).toBeUndefined();
  });

  it('should clear response and error', () => {
    expenseServiceSpy.getExpense.mockReturnValue(of({ id: '1' } as any));

    store.loadById('room-1', '1');

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});
