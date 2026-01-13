import { TestBed } from '@angular/core/testing';

import { StatementService } from './statement.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { IStatement } from '../interfaces/statement';
import { Pagination } from '../interfaces/pagination';

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
      const driveToken = 'driveToken';

      httpSpy.post.and.returnValue(of(void 0));

      service.uploadStatement(officeId, blob, fileName, driveToken).subscribe();

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
      expect(headers.has('X-Google-Drive-Token')).toBeTrue();
    });
  });

  describe('view', () => {
    it('should download statement without drive token', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      httpSpy.get.and.returnValue(of(blob));

      service.view('123').subscribe(result => {
        expect(result).toBe(blob);
      });

      expect(httpSpy.get).toHaveBeenCalledWith(
        'v1/statements/123',
        jasmine.objectContaining({ responseType: 'blob' }),
      );
    });

    it('should download statement with drive token', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      httpSpy.get.and.returnValue(of(blob));

      service.view('123', 'drive-token').subscribe();

      const [, options] = httpSpy.get.calls.mostRecent().args;
      const headers = options?.headers as HttpHeaders;

      expect(headers.get('X-Google-Drive-Token')).toBe('drive-token');
    });
  });

  describe('getStatementsPage', () => {
    it('should fetch paginated statements', () => {
      const response: Pagination<IStatement> = {
        number: 0,
        totalPages: 0,
        content: [],
        totalElements: 0,
      };

      httpSpy.get.and.returnValue(of(response));

      service.getStatementsPage('1', 0, 'date', 'asc', 10)
        .subscribe(result => {
          expect(result).toEqual(response);
        });

      expect(httpSpy.get).toHaveBeenCalledWith(
        'v1/statements/offices/1',
        jasmine.objectContaining({ params: jasmine.any(HttpParams) }),
      );
    });
  });
});
