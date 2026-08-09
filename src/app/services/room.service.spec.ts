import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { RoomService } from './room.service';

describe('RoomService', () => {
  let service: RoomService;
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
      providers: [RoomService, { provide: HttpClient, useValue: httpSpy }],
    });
    service = TestBed.inject(RoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
