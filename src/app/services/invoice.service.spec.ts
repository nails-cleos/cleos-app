import { TestBed } from '@angular/core/testing';

import { InvoiceService } from './invoice.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { IOfficeAll } from '../interfaces/office';
import { IInvoice } from '../interfaces/invoice';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const mockOffice: IOfficeAll = {
    id: '1',
    manager: { id: '1', displayName: 'Officer' },
    name: 'Office 1',
  };

  const invoice: IInvoice = {
    id: '1',
    paths: ['path1', 'path2'],
    customer: {
      id: 'customer-id',
      displayName: 'John Doe',
      email: 'user@test.com',
      authorities: [{ authority: 'ROLE_CUSTOMER' }],
      locale: 'en',
      timeZone: 'UTC',
    },
    room: {
      timeZone: 'UTC',
      currencyCode: 'EUR',
      addressName: 'address',
      phone: '1234567890',
      email: 'room@test.com',
    },
    items: [],
    timestamp: Date.now(),
    totals: {
      subTotal: 121,
      discount: 0,
      price: 100,
      totalPaid: 121,
      excBTW: 100,
      btw: 21,
    },
    discounts: [],
    position: 10,
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        InvoiceService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(InvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all office', () => {
    httpSpy.get.and.returnValue(of([mockOffice]));

    service.getAllMyOffices().subscribe((result) => {
      expect(result).toEqual([mockOffice]);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/invoices/offices');
  });

  describe('getOfficeToInvoice', () => {
    it('should fetch all office to be invoiced by type', () => {
      const officeId = '1';
      const start = '2023-01-01';
      const end = '2023-01-31';
      const types = ['type1', 'type2'];
      httpSpy.get.and.returnValue(of([invoice]));

      service.getOfficeToInvoice(officeId, start, end, types).subscribe((result) => {
        expect(result).toEqual([invoice]);
      });

      let params = new HttpParams().set('start', start).set('end', end);
      types.forEach(type => {
        params = params.append('types', type);
      });

      expect(httpSpy.get).toHaveBeenCalledWith(`v1/invoices/offices/${officeId}`, {
        params: params,
      });
    });

    it('should fetch all office to be invoiced without type', () => {
      const officeId = '1';
      const start = '2023-01-01';
      const end = '2023-01-31';
      httpSpy.get.and.returnValue(of([invoice]));

      service.getOfficeToInvoice(officeId, start, end).subscribe((result) => {
        expect(result).toEqual([invoice]);
      });

      expect(httpSpy.get).toHaveBeenCalledWith(`v1/invoices/offices/${officeId}`, {
        params: new HttpParams().set('start', start).set('end', end),
      });
    });
  });

  describe('uploadInvoices', () => {
    it('should upload invoice without drive token', () => {
      const officeId = '1';
      const blob = new Blob(['test content'], { type: 'application/pdf' });
      const fileName = 'invoice.pdf';

      httpSpy.post.and.returnValue(of(void 0));

      service.uploadInvoices(officeId, blob, fileName).subscribe();

      expect(httpSpy.post).toHaveBeenCalled();

      const [url, body, options] = httpSpy.post.calls.mostRecent().args;

      expect(url).toBe(`v1/invoices/offices/${officeId}`);
      expect(body instanceof FormData).toBeTrue();

      const file = (body as FormData).get('file') as File;
      expect(file).toBeTruthy();
      expect(file.name).toBe(fileName);
      expect(file.type).toBe('application/pdf');

      const headers = options?.headers as HttpHeaders;

      expect(headers.get('Upload')).toBe('true');
      expect(headers.has('X-Google-Drive-Token')).toBeFalse();
    });
    it('should upload invoice with drive token', () => {
      const officeId = '1';
      const blob = new Blob(['test content'], { type: 'application/pdf' });
      const fileName = 'invoice.pdf';
      const driveToken = 'driveToken';

      httpSpy.post.and.returnValue(of(void 0));

      service.uploadInvoices(officeId, blob, fileName, driveToken).subscribe();

      expect(httpSpy.post).toHaveBeenCalled();

      const [url, body, options] = httpSpy.post.calls.mostRecent().args;

      expect(url).toBe(`v1/invoices/offices/${officeId}`);
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
});
