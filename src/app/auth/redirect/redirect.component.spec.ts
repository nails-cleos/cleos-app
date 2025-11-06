import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RedirectComponent } from './redirect.component';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { NavigationService } from '../../services/navigation.service';
import { TokenService } from '../../services/token.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Role } from '../../interfaces/token';
import { AppState } from '../../store/app.states';

describe('RedirectComponent', () => {
  let fixture: ComponentFixture<RedirectComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let navigateServiceSpy: jasmine.SpyObj<NavigationService>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;

  beforeEach(async () => {
    state$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    navigateServiceSpy = jasmine.createSpyObj('NavigationService', ['reload']);
    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['token', 'user']);

    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [RedirectComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: NavigationService, useValue: navigateServiceSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectComponent);

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture.detectChanges();
  });

  it('should not navigate if redirect is false', () => {
    state$.next({ redirect: false });
    expect(navigateServiceSpy.reload).not.toHaveBeenCalled();
  });

  it('should navigate to /en/home if not authenticated', () => {
    state$.next({ redirect: true, isAuthenticated: false });
    expect(navigateServiceSpy.reload).toHaveBeenCalledWith(['en-GB', 'home']);
  });

  it('should navigate to /en/dashboard if user has admin role', () => {
    state$.next({
      redirect: true,
      isAuthenticated: true,
      token: 'fake-token',
      user: { authorities: [{ authority: Role.admin }] },
    });

    expect(tokenServiceSpy.token).toBe('fake-token');
    expect(navigateServiceSpy.reload).toHaveBeenCalledWith(['en-GB', 'dashboard']);
  });

  it('should navigate to /en/events if user has room admin role', () => {
    state$.next({
      redirect: true,
      isAuthenticated: true,
      token: 'fake-token',
      user: { authorities: [{ authority: Role.roomAdmin }] },
    });
    expect(navigateServiceSpy.reload).toHaveBeenCalledWith(['en-GB', 'events']);
  });

  it('should navigate to /en/me/reservations for other roles', () => {
    state$.next({
      redirect: true,
      isAuthenticated: true,
      token: 'fake-token',
      user: { authorities: [{ authority: 'USER' }] },
    });
    expect(navigateServiceSpy.reload).toHaveBeenCalledWith(['en-GB', 'me', 'reservations']);
  });
});
