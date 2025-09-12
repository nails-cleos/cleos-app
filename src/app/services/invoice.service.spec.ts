import { TestBed } from '@angular/core/testing';

import { InvoiceService } from './invoice.service';
import { HttpClient } from '@angular/common/http';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        InvoiceService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(InvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
