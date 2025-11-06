import { TestBed } from '@angular/core/testing';

import { GeocodeService } from './geocode.service';
import { HttpClient } from '@angular/common/http';

describe('GeocodeService', () => {
  let service: GeocodeService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['jsonp']);
    TestBed.configureTestingModule({
      providers: [
        GeocodeService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(GeocodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
