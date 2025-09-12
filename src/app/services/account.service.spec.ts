import { TestBed } from '@angular/core/testing';

import { AccountService } from './account.service';
import { HttpClient } from '@angular/common/http';

describe('AccountService', () => {
  let service: AccountService;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch']);
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
});
