import { TestBed } from '@angular/core/testing';

import { OfficeService } from './office.service';
import { HttpClient } from '@angular/common/http';

describe('OfficeService', () => {
  let service: OfficeService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        OfficeService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(OfficeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
