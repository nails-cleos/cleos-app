import { TestBed } from '@angular/core/testing';

import { ColorService } from './color.service';
import { HttpClient } from '@angular/common/http';

describe('ColorService', () => {
  let service: ColorService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        ColorService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(ColorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
