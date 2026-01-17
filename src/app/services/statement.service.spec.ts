import { TestBed } from '@angular/core/testing';

import { StatementService } from './statement.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';

describe('StatementService', () => {
  let service: StatementService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        StatementService,
        { provide: HttpClient, useValue: httpSpy },
      ],
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

      httpSpy.post.and.returnValue(of(void 0));

      service.uploadStatement(officeId, blob, fileName).subscribe();

      expect(httpSpy.post).toHaveBeenCalled();

      const [url, body, options] = httpSpy.post.calls.mostRecent().args;

      expect(url).toBe(`v1/statements/offices/${officeId}`);
      expect(body instanceof FormData).toBeTrue();

      const file = (body as FormData).get('file') as File;
      expect(file).toBeTruthy();
      expect(file.name).toBe(fileName);
      expect(file.type).toBe('application/pdf');

      const headers = options?.headers as HttpHeaders;

      expect(headers.get('Upload')).toBe('true');
      expect(headers.has('X-Google-Drive-Token')).toBeFalse();
    });

    it('should upload statement with drive token', () => {
      const officeId = '1';
      const blob = new Blob(['test content'], { type: 'application/pdf' });
      const fileName = 'statement.pdf';

      httpSpy.post.and.returnValue(of(void 0));

      service.uploadStatement(officeId, blob, fileName).subscribe();

      expect(httpSpy.post).toHaveBeenCalled();

      const [url, body, options] = httpSpy.post.calls.mostRecent().args;

      expect(url).toBe(`v1/statements/offices/${officeId}`);
      expect(body instanceof FormData).toBeTrue();

      const file = (body as FormData).get('file') as File;
      expect(file).toBeTruthy();
      expect(file.name).toBe(fileName);
      expect(file.type).toBe('application/pdf');

      const headers = options?.headers as HttpHeaders;

      expect(headers.get('Upload')).toBe('true');
    });
  });
});
