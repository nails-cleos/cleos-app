import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NavComponent } from './nav.component';
import { TranslateModule } from '@ngx-translate/core';
import { TokenService } from '../services/token.service';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { MessagingService } from '../services/messaging.service';
import { AuthUserService } from '../services/auth-user.service';
import { ActivatedRoute } from '@angular/router';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  const mockTokenService = {
    token: jasmine.createSpy('token'),
    user: jasmine.createSpy('user'),
  };
  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };
  const mockMessagingService = {
    requestPermission: jasmine.createSpy('requestPermission').and.returnValue(Promise.resolve()),
    receiveMessage: jasmine.createSpy('receiveMessage').and.returnValue(of({})),
    message$: jasmine.createSpy('message'),
  };

  const mockAuthUserService = {
    cookieConsent: jasmine.createSpy('cookieConsent'),
    reloadUser: jasmine.createSpy('reloadUser'),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue(null),
      },
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NavComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TokenService, useValue: mockTokenService },
        { provide: Store, useValue: mockStore },
        { provide: MessagingService, useValue: mockMessagingService },
        { provide: AuthUserService, useValue: mockAuthUserService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
