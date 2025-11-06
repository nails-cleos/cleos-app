import { TestBed } from '@angular/core/testing';

import { SeoService } from './seo.service';
import { Meta, Title } from '@angular/platform-browser';

describe('SeoService', () => {
  let service: SeoService;
  let meta: jasmine.SpyObj<Meta>;
  let titleService: jasmine.SpyObj<Title>;

  beforeEach(() => {
    meta = jasmine.createSpyObj('Meta', ['updateTag']);
    titleService = jasmine.createSpyObj('Title', ['setTitle']);
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        { provide: Meta, useValue: meta },
        { provide: Title, useValue: titleService },
      ],
    });
    service = TestBed.inject(SeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
