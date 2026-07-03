import { TestBed } from '@angular/core/testing';
import { ExpenseService } from './expense.service';
import { SortDirection } from '@angular/material/sort';
import { IExpense } from '../room/me/expense/expense';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { skipLoadingOverlay } from '../interfaces/pagination';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const roomId = 'room-123';

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
      'get',
      'post',
      'patch',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ExpenseService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });

    service = TestBed.inject(ExpenseService);
  });

  it('should get paginated expenses with filters and date', () => {
    httpSpy.get.and.returnValue(of({}));

    service.getExpensesPage(
      roomId,
      'amount',
      'asc' as SortDirection,
      1,
      10,
      'food',
      '2025-01-01',
    ).subscribe();

    expect(httpSpy.get).toHaveBeenCalled();

    const [url, options] = httpSpy.get.calls.mostRecent().args;

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
    httpSpy.get.and.returnValue(of({}));

    service.getExpensesPage(
      roomId,
      'amount',
      'asc' as SortDirection,
      1,
      10,
      'food',
    ).subscribe();

    expect(httpSpy.get).toHaveBeenCalled();

    const [url, options] = httpSpy.get.calls.mostRecent().args;

    expect(url).toBe(`v1/rooms/${roomId}/expenses/pages`);

    const params = options?.params as HttpParams;
    expect(params.get('page')).toBe('1');
    expect(params.get('size')).toBe('10');
    expect(params.get('sort')).toBe('amount');
    expect(params.get('direction')).toBe('asc');
    expect(params.get('filter')).toBe('food');
  });

  it('should get all expenses info', () => {
    httpSpy.get.and.returnValue(of({}));

    service.getAllExpensesInfo(roomId).subscribe();

    expect(httpSpy.get).toHaveBeenCalledWith(`v1/rooms/${roomId}/expenses/info`, { ...skipLoadingOverlay() });
  });

  it('should get a single expense by id', () => {
    httpSpy.get.and.returnValue(of({}));

    service.getExpense(roomId, 'exp-1').subscribe();

    expect(httpSpy.get).toHaveBeenCalledWith(`v1/rooms/${roomId}/expenses/exp-1`, { ...skipLoadingOverlay() });
  });

  it('should create expense', () => {
    httpSpy.post.and.returnValue(of({ success: true }));

    const expense = { amount: 10 } as IExpense;
    const file = new File(['data'], 'receipt.pdf');

    service.createExpense(roomId, expense, file).subscribe();

    expect(httpSpy.post).toHaveBeenCalled();

    const [url, body, options] = httpSpy.post.calls.mostRecent().args;

    expect(url).toBe(`v1/rooms/${roomId}/expenses`);
    expect(body instanceof FormData).toBeTrue();

    const headers = options?.headers as HttpHeaders;
    expect(headers.get('Upload')).toBe('true');

    const formData = body as FormData;
    expect(formData.has('file')).toBeTrue();
    expect(formData.has('expense')).toBeTrue();
  });

  it('should delete expense', () => {
    httpSpy.delete.and.returnValue(of(void 0));

    service.deleteExpense(roomId, 'exp-1').subscribe();

    expect(httpSpy.delete).toHaveBeenCalledWith(`v1/rooms/${roomId}/expenses/exp-1`);
  });

  it('should update expense with file', () => {
    httpSpy.patch.and.returnValue(of({ success: true }));

    const expense = { amount: 99 } as IExpense;
    const file = new File(['data'], 'receipt.pdf');

    service.updateExpense('exp-1', roomId, expense, file).subscribe();

    expect(httpSpy.patch).toHaveBeenCalled();

    const [url, body, options] = httpSpy.patch.calls.mostRecent().args;

    expect(url).toBe(`v1/rooms/${roomId}/expenses/exp-1`);
    expect(body instanceof FormData).toBeTrue();

    const headers = options?.headers as HttpHeaders;
    expect(headers.get('Upload')).toBe('true');

    const formData = body as FormData;
    expect(formData.has('file')).toBeTrue();
    expect(formData.has('expense')).toBeTrue();
  });

  it('should update expense without file', () => {
    httpSpy.patch.and.returnValue(of({ success: true }));

    const expense = { amount: 99 } as IExpense;

    service.updateExpense('exp-1', roomId, expense).subscribe();

    const [, body] = httpSpy.patch.calls.mostRecent().args;

    const formData = body as FormData;
    expect(formData.has('file')).toBeFalse();
    expect(formData.has('expense')).toBeTrue();
  });

  it('should replace roomId and append args correctly', () => {
    httpSpy.get.and.returnValue(of({}));

    service.getExpense('room-x', 'id-y').subscribe();

    expect(httpSpy.get).toHaveBeenCalledWith('v1/rooms/room-x/expenses/id-y', { ...skipLoadingOverlay() });
  });
});
