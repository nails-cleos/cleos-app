import { TestBed } from '@angular/core/testing';

import { TokenService } from './token.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Auth } from '@angular/fire/auth';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    const authSpy = jasmine.createSpyObj('Auth', ['select', 'dispatch']);

    routerSpy.getCurrentNavigation.and.returnValue(null);
    authSpy.select.and.returnValue(of({ user: { authorities: [{ authority: 'ROLE_USER' }] } }));

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        TokenService,
        { provide: Router, useValue: routerSpy },
        { provide: Auth, useValue: authSpy },
      ],
    });

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
