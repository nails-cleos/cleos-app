import { TestBed } from '@angular/core/testing';

import { DiscountService } from './discount.service';
import { HttpClient } from '@angular/common/http';

describe('DiscountService', () => {
  let service: DiscountService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        DiscountService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(DiscountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
