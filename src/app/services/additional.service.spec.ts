import { TestBed } from '@angular/core/testing';

import { AdditionalService } from './additional.service';

describe('AdditionalService', () => {
  let service: AdditionalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdditionalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
