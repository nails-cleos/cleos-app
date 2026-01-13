import { TestBed } from '@angular/core/testing';

import { OfficeService } from './office.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { IOfficeAll } from '../interfaces/office';

describe('OfficeService', () => {
  let service: OfficeService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const mockOffice: IOfficeAll = {
    id: '1',
    manager: { id: '1', displayName: 'Officer' },
    name: 'Office 1',
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        OfficeService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(OfficeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all office', () => {
    httpSpy.get.and.returnValue(of([mockOffice]));

    service.getAllMyOffices().subscribe((result) => {
      expect(result).toEqual([mockOffice]);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/offices/me');
  });
});
