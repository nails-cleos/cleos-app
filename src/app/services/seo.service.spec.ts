import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { SeoService } from './seo.service';
import { Meta, Title } from '@angular/platform-browser';

describe('SeoService', () => {
  let service: SeoService;
  let metaSpy: Pick<Meta, 'updateTag'> & {
    updateTag: ReturnType<typeof vi.fn>;
  };
  let titleServiceSpy: Pick<Title, 'setTitle'> & {
    setTitle: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    metaSpy = {
      updateTag: vi.fn().mockName('Meta.updateTag'),
    };
    titleServiceSpy = {
      setTitle: vi.fn().mockName('Title.setTitle'),
    };
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        { provide: Meta, useValue: metaSpy },
        { provide: Title, useValue: titleServiceSpy },
      ],
    });
    service = TestBed.inject(SeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
