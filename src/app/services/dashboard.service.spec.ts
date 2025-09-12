import { TestBed } from '@angular/core/testing';

import { DashboardService } from './dashboard.service';
import { HttpClient } from '@angular/common/http';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(DashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
