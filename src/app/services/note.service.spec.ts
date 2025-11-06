import { TestBed } from '@angular/core/testing';

import { NoteService } from './note.service';
import { HttpClient } from '@angular/common/http';

describe('NoteService', () => {
  let service: NoteService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        NoteService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(NoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
