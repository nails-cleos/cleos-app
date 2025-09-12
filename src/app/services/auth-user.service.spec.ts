import { TestBed } from '@angular/core/testing';

import { AuthUserService } from './auth-user.service';
import { NgcCookieConsentService } from 'ngx-cookieconsent';

describe('AuthUserService', () => {
  let service: AuthUserService;

  beforeEach(() => {
    const cookieSpy = jasmine.createSpyObj('cookieConsentService', ['getConfig', 'destroy', 'init']);
    TestBed.configureTestingModule({
      providers: [
        AuthUserService,
        { provide: NgcCookieConsentService, useValue: cookieSpy },
      ],
    });
    service = TestBed.inject(AuthUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
