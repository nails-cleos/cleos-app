import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ExpenseService } from './expense.service';
import { SortDirection } from '@angular/material/sort';
import { IExpense } from '../room/me/expense/expense';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { skipLoadingOverlay } from '../interfaces/pagination';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let httpSpy: Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'> & {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const roomId = 'room-123';

  beforeEach(() => {
    httpSpy = {
      get: vi.fn().mockName('HttpClient.get'),
      post: vi.fn().mockName('HttpClient.post'),
      patch: vi.fn().mockName('HttpClient.patch'),
      delete: vi.fn().mockName('HttpClient.delete'),
    };

    TestBed.configureTestingModule({
      providers: [ExpenseService, { provide: HttpClient, useValue: httpSpy }],
      teardown: {
        destroyAfterEach: true,
      },
    });

    service = TestBed.inject(ExpenseService);
  });

  it('should get paginated expenses with filters and date', () => {
    httpSpy.get.mockReturnValue(of({}));

    service
      .getExpensesPage(
        roomId,
        'amount',
        'asc' as SortDirection,
        1,
        10,
        'food',
        '2025-01-01',
      )
      .subscribe();

    expect(httpSpy.get).toHaveBeenCalled();

    const lastCall = vi.mocked(httpSpy.get).mock.lastCall;

    expect(lastCall).toBeDefined();

    const [url, options] = lastCall!;

    expect(url).toBe(`v1/rooms/${roomId}/expenses/pages`);

    const params = options?.params as HttpParams;
    expect(params.get('page')).toBe('1');
    expect(params.get('size')).toBe('10');
    expect(params.get('sort')).toBe('amount');
    expect(params.get('direction')).toBe('asc');
    expect(params.get('filter')).toBe('food');
    expect(params.get('date')).toBe('2025-01-01');
  });

  it('should get paginated expenses with filters', () => {
    httpSpy.get.mockReturnValue(of({}));

    service
      .getExpensesPage(roomId, 'amount', 'asc' as SortDirection, 1, 10, 'food')
      .subscribe();

    expect(httpSpy.get).toHaveBeenCalled();

    const lastCall = vi.mocked(httpSpy.get).mock.lastCall;

    expect(lastCall).toBeDefined();

    const [url, options] = lastCall!;

    expect(url).toBe(`v1/rooms/${roomId}/expenses/pages`);

    const params = options?.params as HttpParams;
    expect(params.get('page')).toBe('1');
    expect(params.get('size')).toBe('10');
    expect(params.get('sort')).toBe('amount');
    expect(params.get('direction')).toBe('asc');
    expect(params.get('filter')).toBe('food');
  });

  it('should get all expenses info', () => {
    httpSpy.get.mockReturnValue(of({}));

    service.getAllExpensesInfo(roomId).subscribe();

    expect(httpSpy.get).toHaveBeenCalledWith(
      `v1/rooms/${roomId}/expenses/info`,
      { ...skipLoadingOverlay() },
    );
  });

  it('should get a single expense by id', () => {
    httpSpy.get.mockReturnValue(of({}));

    service.getExpense(roomId, 'exp-1').subscribe();

    expect(httpSpy.get).toHaveBeenCalledWith(
      `v1/rooms/${roomId}/expenses/exp-1`,
      { ...skipLoadingOverlay() },
    );
  });

  it('should create expense', () => {
    httpSpy.post.mockReturnValue(of({ success: true }));

    const expense = { amount: 10 } as IExpense;
    const file = new File(['data'], 'receipt.pdf');

    service.createExpense(roomId, expense, file).subscribe();

    expect(httpSpy.post).toHaveBeenCalled();

    const lastCall = vi.mocked(httpSpy.post).mock.lastCall;

    expect(lastCall).toBeDefined();

    const [url, body, options] = lastCall!;

    expect(url).toBe(`v1/rooms/${roomId}/expenses`);
    expect(body instanceof FormData).toBe(true);

    const headers = options?.headers as HttpHeaders;
    expect(headers.get('Upload')).toBe('true');

    const formData = body as FormData;
    expect(formData.has('file')).toBe(true);
    expect(formData.has('expense')).toBe(true);
  });

  it('should delete expense', () => {
    httpSpy.delete.mockReturnValue(of(void 0));

    service.deleteExpense(roomId, 'exp-1').subscribe();

    expect(httpSpy.delete).toHaveBeenCalledWith(
      `v1/rooms/${roomId}/expenses/exp-1`,
    );
  });

  it('should update expense with file', () => {
    httpSpy.patch.mockReturnValue(of({ success: true }));

    const expense = { amount: 99 } as IExpense;
    const file = new File(['data'], 'receipt.pdf');

    service.updateExpense('exp-1', roomId, expense, file).subscribe();

    expect(httpSpy.patch).toHaveBeenCalled();

    const lastCall = vi.mocked(httpSpy.patch).mock.lastCall;

    expect(lastCall).toBeDefined();

    const [url, body, options] = lastCall!;

    expect(url).toBe(`v1/rooms/${roomId}/expenses/exp-1`);
    expect(body instanceof FormData).toBe(true);

    const headers = options?.headers as HttpHeaders;
    expect(headers.get('Upload')).toBe('true');

    const formData = body as FormData;
    expect(formData.has('file')).toBe(true);
    expect(formData.has('expense')).toBe(true);
  });

  it('should update expense without file', () => {
    httpSpy.patch.mockReturnValue(of({ success: true }));

    const expense = { amount: 99 } as IExpense;

    service.updateExpense('exp-1', roomId, expense).subscribe();

    const lastCall = vi.mocked(httpSpy.patch).mock.lastCall;

    expect(lastCall).toBeDefined();

    const [, body] = lastCall!;

    const formData = body as FormData;
    expect(formData.has('file')).toBe(false);
    expect(formData.has('expense')).toBe(true);
  });

  it('should replace roomId and append args correctly', () => {
    httpSpy.get.mockReturnValue(of({}));

    service.getExpense('room-x', 'id-y').subscribe();

    expect(httpSpy.get).toHaveBeenCalledWith('v1/rooms/room-x/expenses/id-y', {
      ...skipLoadingOverlay(),
    });
  });
});
