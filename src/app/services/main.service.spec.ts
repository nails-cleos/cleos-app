import { TestBed } from '@angular/core/testing';

import { MainService } from './main.service';
import { HttpClient } from '@angular/common/http';

describe('MainService', () => {
  let service: MainService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        MainService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(MainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
