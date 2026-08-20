import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import {
  AuthUserService,
  IAuthUser,
  initialAuthUser,
} from './services/auth-user.service';
import { signal } from '@angular/core';
import { DEFAULT_LOCALE } from './util/dates';
import { NavigationService } from './services/navigation.service';
import { BehaviorSubject } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let navigationServiceSpy: {
    urlLanguage$: BehaviorSubject<any>;
    resetConfig: Mock;
  };

  let urlLanguage$: BehaviorSubject<string>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  beforeEach(async () => {
    urlLanguage$ = new BehaviorSubject(DEFAULT_LOCALE);
    navigationServiceSpy = {
      urlLanguage$: urlLanguage$,
      resetConfig: vi.fn().mockName('resetConfig'),
    };

    const authUserServiceMock = {
      authUser: authUserSignal.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: AuthUserService, useValue: authUserServiceMock },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch setLanguage when authUser emits', () => {
    authUserSignal.update((prev) => ({
      ...prev,
      locale: 'es',
      theme: 'dark-theme',
      isAuthenticated: true,
    }));
    fixture.detectChanges();

    expect(navigationServiceSpy.resetConfig).toHaveBeenCalledWith(
      'es',
      'dark-theme',
    );
  });
});
