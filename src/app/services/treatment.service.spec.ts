import { TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { TreatmentService } from './treatment.service';

describe('TreatmentService', () => {
  let service: TreatmentService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        TreatmentService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(TreatmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
