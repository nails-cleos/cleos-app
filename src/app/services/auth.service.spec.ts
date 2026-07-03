import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Token } from '../interfaces/token';
import { IUserAll } from '../user/user';

describe('AuthService', () => {
  let service: AuthService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

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
    httpSpy = jasmine.createSpyObj('HttpClient', ['post']);
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpSpy },
      ],
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
    httpSpy.post.and.returnValue(of(mockApiResponse));

    service.login(token, code, theme).subscribe((result) => {
      expect(result).toEqual(mockApiResponse);
    });

    expect(httpSpy.post).toHaveBeenCalledWith('v1/auth/login', { token, code, theme });
  });
});
