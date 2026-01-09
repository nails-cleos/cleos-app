import { TestBed } from '@angular/core/testing';

import { TokenService } from './token.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { Store } from '@ngrx/store';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    const authSpy = jasmine.createSpyObj('Auth', ['select']);
    const storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);

    routerSpy.getCurrentNavigation.and.returnValue(null);
    authSpy.select.and.returnValue(of({ user: { authorities: [{ authority: 'ROLE_USER' }] } }));
    storeSpy.pipe.and.returnValue(of(null));

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        TokenService,
        { provide: Router, useValue: routerSpy },
        { provide: Auth, useValue: authSpy },
        { provide: Store, useValue: storeSpy },
      ],
    });

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
