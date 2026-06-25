import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { ThemeService } from 'ng2-charts';
import { DateAdapter } from '@angular/material/core';

import { AppComponent } from './app.component';
import { AuthUserService, IAuthUser, initialAuthUser } from './services/auth-user.service';
import { SeoService } from './services/seo.service';
import { signal } from '@angular/core';
import { DEFAULT_LOCALE } from './util/dates';
import { I18NStore } from './store/i18n.store';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  let i18nStoreSpy: {
    setLanguage: jasmine.Spy;
  };

  let seoSpy: jasmine.SpyObj<SeoService>;
  let overlayContainerSpy: jasmine.SpyObj<OverlayContainer>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  beforeEach(async () => {
    i18nStoreSpy = {
      setLanguage: jasmine.createSpy('setLanguage'),
    };
    overlayContainerSpy = jasmine.createSpyObj('OverlayContainer', ['getContainerElement']);
    themeServiceSpy = jasmine.createSpyObj('ThemeService', ['setColorschemesOptions']);
    seoSpy = jasmine.createSpyObj('SeoService', ['setMetaDescription', 'setMetaTitle']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get', 'set']);

    cookieServiceSpy.get.and.returnValue('light-theme');
    overlayContainerSpy.getContainerElement.and.returnValue(document.createElement('div'));

    const authUserServiceMock = {
      authUser: authUserSignal.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot()],
      providers: [
        { provide: SeoService, useValue: seoSpy },
        { provide: I18NStore, useValue: i18nStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceMock },
        { provide: OverlayContainer, useValue: overlayContainerSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: ThemeService, useValue: themeServiceSpy },
        { provide: DateAdapter, useValue: { setLocale: jasmine.createSpy() } },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);
    translateService.setTranslation(DEFAULT_LOCALE, { META: { CONTENT: 'desc', TITLE: 'title' } });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch setLanguage when authUser emits', () => {
    authUserSignal.update(prev => ({ ...prev, locale: 'es', theme: 'dark-theme', isAuthenticated: true }));
    fixture.detectChanges();

    expect(i18nStoreSpy.setLanguage).toHaveBeenCalledWith('es');
  });

  it('should call seoService and reset theme when authUser emits', () => {
    authUserSignal.update(prev => ({ ...prev, locale: 'es', theme: 'dark-theme', isAuthenticated: true }));
    fixture.detectChanges();

    expect(seoSpy.setMetaDescription).toHaveBeenCalledWith('desc');
    expect(seoSpy.setMetaTitle).toHaveBeenCalledWith('title');
    expect(i18nStoreSpy.setLanguage).toHaveBeenCalledWith('es');
  });
});
