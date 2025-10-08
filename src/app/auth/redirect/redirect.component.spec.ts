import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RedirectComponent } from './redirect.component';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { NavigationService } from '../../services/navigation.service';
import { TokenService } from '../../services/token.service';
import { TranslateService } from '@ngx-translate/core';
import { Role } from '../../interfaces/token';

describe('RedirectComponent', () => {
  let fixture: ComponentFixture<RedirectComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let stateSubject: Subject<any>;
  let navigateServiceSpy: jasmine.SpyObj<NavigationService>;
  let tokenService: TokenService;

  beforeEach(async () => {
    stateSubject = new Subject<any>();

    mockStore = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
    mockStore.select.and.returnValue(stateSubject.asObservable());

    navigateServiceSpy = jasmine.createSpyObj('NavigationService', ['reload']);
    const mockTokenService = {
      token: jasmine.createSpy('token'),
      user: jasmine.createSpy('user'),
    };

    await TestBed.configureTestingModule({
      imports: [RedirectComponent],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: NavigationService, useValue: navigateServiceSpy },
        { provide: TokenService, useValue: mockTokenService },
        {
          provide: TranslateService,
          useValue: { currentLang: 'en-GB' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectComponent);
    tokenService = TestBed.inject(TokenService);
    fixture.detectChanges();
  });

  it('should not navigate if redirect is false', () => {
    stateSubject.next({ redirect: false });
    expect(navigateServiceSpy.reload).not.toHaveBeenCalled();
  });

  it('should navigate to /en/home if not authenticated', () => {
    stateSubject.next({ redirect: true, isAuthenticated: false });
    expect(navigateServiceSpy.reload).toHaveBeenCalledWith(['en-GB', 'home']);
  });

  it('should navigate to /en/dashboard if user has admin role', () => {
    stateSubject.next({
      redirect: true,
      isAuthenticated: true,
      token: 'fake-token',
      user: { authorities: [{ authority: Role.admin }] },
    });

    expect(tokenService.token).toBe('fake-token');
    expect(navigateServiceSpy.reload).toHaveBeenCalledWith(['en-GB', 'dashboard']);
  });

  it('should navigate to /en/events if user has room admin role', () => {
    stateSubject.next({
      redirect: true,
      isAuthenticated: true,
      token: 'fake-token',
      user: { authorities: [{ authority: Role.roomAdmin }] },
    });
    expect(navigateServiceSpy.reload).toHaveBeenCalledWith(['en-GB', 'events']);
  });

  it('should navigate to /en/me/reservations for other roles', () => {
    stateSubject.next({
      redirect: true,
      isAuthenticated: true,
      token: 'fake-token',
      user: { authorities: [{ authority: 'USER' }] },
    });
    expect(navigateServiceSpy.reload).toHaveBeenCalledWith(['en-GB', 'me', 'reservations']);
  });
});
