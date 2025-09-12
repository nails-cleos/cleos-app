import { TestBed } from '@angular/core/testing';

import { CatalogueService } from './catalogue.service';
import { HttpClient } from '@angular/common/http';

describe('CatalogueService', () => {
  let service: CatalogueService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        CatalogueService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(CatalogueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
