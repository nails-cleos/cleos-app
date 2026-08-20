import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Token } from '../interfaces/token';
import { IUserAll } from '../user/user';

describe('AuthService', () => {
  let service: AuthService;
  let httpSpy: Pick<HttpClient, 'post'> & {
    post: ReturnType<typeof vi.fn>;
  };

  const mockApiResponse: Token = {
    tokenAccess: 'mockTokenAccess',
    user: {
      id: '1',
      displayName: 'testuser',
      email: 'testUser@test.com',
    } as IUserAll,
    menus: [],
  };

  beforeEach(() => {
    httpSpy = {
      post: vi.fn().mockName('HttpClient.post'),
    };
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: HttpClient, useValue: httpSpy }],
      teardown: {
        destroyAfterEach: true,
      },
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login', () => {
    const token = 'mockToken';
    const code = 'mockCode';
    const theme = 'dark';
    httpSpy.post.mockReturnValue(of(mockApiResponse));

    service.login(token, code, theme).subscribe((result) => {
      expect(result).toEqual(mockApiResponse);
    });

    expect(httpSpy.post).toHaveBeenCalledWith('v1/auth/login', {
      token,
      code,
      theme,
    });
  });
});
