import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RedirectComponent } from './redirect.component';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { NavigationService } from '../../services/navigation.service';
import { TokenService } from '../../services/token.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Role } from '../../interfaces/token';
import { AuthState } from '../../store/reducers/auth.reducers';
import { computed, signal } from '@angular/core';
import { DEFAULT_LOCALE } from '../../util/dates';

describe('RedirectComponent', () => {
  let fixture: ComponentFixture<RedirectComponent>;

  let redirect$: BehaviorSubject<any>;
  let isAuthenticated$: BehaviorSubject<any>;
  let user$: BehaviorSubject<any>;

  let storeSpy: jasmine.SpyObj<Store<AuthState>>;
  let navigateServiceSpy: jasmine.SpyObj<NavigationService>;

  const tokenSignal = signal<string | null>('abc');

  const tokenServiceMock = {
    token: computed(() => tokenSignal()),
    user: signal<any>(null),
  };

  Object.defineProperty(tokenServiceMock, 'setToken', {
    set: jasmine.createSpy('setToken').and.callFake((t: string) => {
      tokenSignal.set(t);
    }),
  });

  Object.defineProperty(tokenServiceMock, 'setUser', {
    set: jasmine.createSpy('setUser'),
  });

  beforeEach(async () => {
    redirect$ = new BehaviorSubject(undefined);
    isAuthenticated$ = new BehaviorSubject(undefined);
    user$ = new BehaviorSubject(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    navigateServiceSpy = jasmine.createSpyObj('NavigationService', ['reload']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return redirect$.asObservable();
        case 2:
          return isAuthenticated$.asObservable();
        case 3:
          return user$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [RedirectComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: NavigationService, useValue: navigateServiceSpy },
        { provide: TokenService, useValue: tokenServiceMock  },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectComponent);

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture.detectChanges();
  });

  it('should not navigate if redirect is false', () => {
    redirect$.next(false);

    expect(navigateServiceSpy.reload).not.toHaveBeenCalled();
  });

  it('should navigate to /en/home if not authenticated', () => {
    redirect$.next(true);
    fixture.detectChanges();

    redirect$.next(false);
    isAuthenticated$.next(false);

    expect(navigateServiceSpy.reload).toHaveBeenCalledWith([DEFAULT_LOCALE, 'home']);
  });

  it('should navigate to /en/dashboard if user has admin role', () => {
    redirect$.next(true);
    isAuthenticated$.next(true);
    user$.next({ authorities: [{ authority: Role.admin }] });
    fixture.detectChanges();

    expect(tokenServiceMock.token()).toBe('abc');
    expect(navigateServiceSpy.reload).toHaveBeenCalledWith([DEFAULT_LOCALE, 'dashboard']);
  });

  it('should navigate to /en/events if user has room admin role', () => {
    redirect$.next(true);
    isAuthenticated$.next(true);
    user$.next({ authorities: [{ authority: Role.roomAdmin }] });
    fixture.detectChanges();

    expect(navigateServiceSpy.reload).toHaveBeenCalledWith([DEFAULT_LOCALE, 'dashboard', 'events']);
  });

  it('should navigate to /en/me/reservations for other roles', () => {
    redirect$.next(true);
    isAuthenticated$.next(true);
    user$.next({ authorities: [{ authority: 'USER' }] });
    fixture.detectChanges();

    expect(navigateServiceSpy.reload).toHaveBeenCalledWith([DEFAULT_LOCALE, 'me', 'reservations']);
  });
});
