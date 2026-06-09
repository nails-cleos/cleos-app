import { TestBed } from '@angular/core/testing';

import { AccountService } from './account.service';
import { HttpClient } from '@angular/common/http';
import { IAccountAll, IAccountTransaction, ITransaction } from '../account/account';
import { of } from 'rxjs';
import { IApiResponse } from '../interfaces/common';
import { createFilter } from '../util/service-helper';
import { IUserAll } from '../user/user';
import { ICurrencyAll } from '../currency/currency';

describe('AccountService', () => {
  let service: AccountService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const mockTransaction: ITransaction = {
    id: '1',
  };

  const mockCustomer: IUserAll = {
    id: 'customer-id',
    displayName: 'John Doe',
    email: 'user@test.com',
    authorities: [{ authority: 'ROLE_CUSTOMER' }],
    locale: 'en',
    timeZone: 'UTC',
  };

  const mockCurrency: ICurrencyAll = {
    id: '1',
    name: 'Euro',
    code: 'EUR',
    icon: '€',
  };

  const mockAccount: IAccountAll = {
    id: '1',
    balance: 100,
    customer: mockCustomer,
    currency: mockCurrency,
  };

  const mockApiResponse: IApiResponse = {
    id: 'response-123',
    name: 'Operation successful',
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch']);
    TestBed.configureTestingModule({
      providers: [
        AccountService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(AccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTransactionsByAccountId', () => {
    it('should fetch transactions with correct parameters', () => {
      const mockResult: IAccountTransaction = {
        transactions: {
          content: [mockTransaction],
          totalElements: 1,
          totalPages: 1,
          number: 0,
        },
      };
      httpSpy.get.and.returnValue(of(mockResult));

      service.getTransactionsByAccountId('1', 0, 'name', 'asc', 5).subscribe((result) => {
        expect(result).toEqual(mockResult);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/accounts/1/transactions', {
        params: createFilter(0, 5, 'name', 'asc'),
      });
    });
  });

  it('should fetch account by id', () => {
    httpSpy.get.and.returnValue(of(mockAccount));

    service.getAccount('1').subscribe((result) => {
      expect(result).toEqual(mockAccount);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/accounts/1');
  });

  it('should fetch transaction by id', () => {
    httpSpy.get.and.returnValue(of(mockTransaction));

    service.getTransaction('ac-1', 'tr-1').subscribe((result) => {
      expect(result).toEqual(mockTransaction);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/accounts/ac-1/transactions/tr-1');
  });

  it('should fetch account by customer id', () => {
    httpSpy.get.and.returnValue(of(mockAccount));

    service.getAccountByCustomerId('c-1').subscribe((result) => {
      expect(result).toEqual(mockAccount);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/accounts/customers/c-1');
  });

  it('should create new transaction', () => {
    httpSpy.post.and.returnValue(of(mockApiResponse));

    service.createTransaction('ac-1', mockTransaction).subscribe((result) => {
      expect(result).toEqual(mockApiResponse);
    });

    expect(httpSpy.post).toHaveBeenCalledWith('v1/accounts/ac-1/transactions', mockTransaction);
  });

  it('should update account by id', () => {
    httpSpy.patch.and.returnValue(of(mockApiResponse));

    service.updateAccount('ac-1', mockTransaction).subscribe((result) => {
      expect(result).toEqual(mockApiResponse);
    });

    expect(httpSpy.patch).toHaveBeenCalledWith('v1/accounts/ac-1', mockTransaction);
  });
});
