import { TestBed } from '@angular/core/testing';

import { UnavailableService } from './unavailable.service';

describe('UnavailableService', () => {
  let service: UnavailableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnavailableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
