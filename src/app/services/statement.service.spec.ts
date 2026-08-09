import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { StatementService } from './statement.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';

describe('StatementService', () => {
  let service: StatementService;
  let httpSpy: Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'> & {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    httpSpy = {
      get: vi.fn().mockName('HttpClient.get'),
      post: vi.fn().mockName('HttpClient.post'),
      patch: vi.fn().mockName('HttpClient.patch'),
      delete: vi.fn().mockName('HttpClient.delete'),
    };
    TestBed.configureTestingModule({
      providers: [StatementService, { provide: HttpClient, useValue: httpSpy }],
    });
    service = TestBed.inject(StatementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadStatements', () => {
    it('should upload statement without drive token', () => {
      const officeId = '1';
      const blob = new Blob(['test content'], { type: 'application/pdf' });
      const fileName = 'statement.pdf';

      httpSpy.post.mockReturnValue(of(void 0));

      service.uploadStatement(officeId, blob, fileName).subscribe();

      expect(httpSpy.post).toHaveBeenCalled();

      const lastCall = vi.mocked(httpSpy.post).mock.lastCall;

      expect(lastCall).toBeDefined();

      const [url, body, options] = lastCall!;

      expect(url).toBe(`v1/statements/offices/${officeId}`);
      expect(body instanceof FormData).toBe(true);

      const file = (body as FormData).get('file') as File;
      expect(file).toBeTruthy();
      expect(file.name).toBe(fileName);
      expect(file.type).toBe('application/pdf');

      const headers = options?.headers as HttpHeaders;

      expect(headers.get('Upload')).toBe('true');
      expect(headers.has('X-Google-Drive-Token')).toBe(false);
    });

    it('should upload statement with drive token', () => {
      const officeId = '1';
      const blob = new Blob(['test content'], { type: 'application/pdf' });
      const fileName = 'statement.pdf';

      httpSpy.post.mockReturnValue(of(void 0));

      service.uploadStatement(officeId, blob, fileName).subscribe();

      expect(httpSpy.post).toHaveBeenCalled();

      const lastCall = vi.mocked(httpSpy.post).mock.lastCall;

      expect(lastCall).toBeDefined();

      const [url, body, options] = lastCall!;

      expect(url).toBe(`v1/statements/offices/${officeId}`);
      expect(body instanceof FormData).toBe(true);

      const file = (body as FormData).get('file') as File;
      expect(file).toBeTruthy();
      expect(file.name).toBe(fileName);
      expect(file.type).toBe('application/pdf');

      const headers = options?.headers as HttpHeaders;

      expect(headers.get('Upload')).toBe('true');
    });
  });
});
