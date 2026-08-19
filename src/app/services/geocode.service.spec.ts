import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { GeocodeService } from './geocode.service';
import { HttpClient } from '@angular/common/http';

describe('GeocodeService', () => {
  let service: GeocodeService;
  let httpSpy: Pick<HttpClient, 'jsonp'> & {
    jsonp: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    httpSpy = {
      jsonp: vi.fn().mockName('HttpClient.jsonp'),
    };
    TestBed.configureTestingModule({
      providers: [GeocodeService, { provide: HttpClient, useValue: httpSpy }],
      teardown: {
        destroyAfterEach: true,
      },
    });
    service = TestBed.inject(GeocodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
