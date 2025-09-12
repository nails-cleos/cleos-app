import { TestBed } from '@angular/core/testing';

import { ExpenseService } from './expense.service';
import { HttpClient } from '@angular/common/http';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        ExpenseService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(ExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
