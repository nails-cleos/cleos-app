import { TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { UnavailableService } from './unavailable.service';

describe('UnavailableService', () => {
  let service: UnavailableService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        UnavailableService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(UnavailableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
