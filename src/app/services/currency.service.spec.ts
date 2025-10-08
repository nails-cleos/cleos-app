import { TestBed } from '@angular/core/testing';

import { CurrencyService } from './currency.service';
import { HttpClient } from '@angular/common/http';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        CurrencyService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(CurrencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
