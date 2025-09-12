import { TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { RoomService } from './room.service';

describe('RoomService', () => {
  let service: RoomService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        RoomService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(RoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
