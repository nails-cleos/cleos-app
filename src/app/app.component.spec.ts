import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { ThemeService } from 'ng2-charts';
import { DateAdapter } from '@angular/material/core';
import { Store } from '@ngrx/store';

import { AppComponent } from './app.component';
import { AuthUserService, IAuthUser, initialAuthUser } from './services/auth-user.service';
import { SeoService } from './services/seo.service';
import { signal } from '@angular/core';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let translateSpy: jasmine.SpyObj<TranslateService>;
  let seoSpy: jasmine.SpyObj<SeoService>;
  let overlayContainerSpy: jasmine.SpyObj<OverlayContainer>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;
  let storeSpy: jasmine.SpyObj<Store<any>>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  beforeEach(async () => {
    translateSpy = jasmine.createSpyObj('TranslateService', ['use', 'instant']);
    overlayContainerSpy = jasmine.createSpyObj('OverlayContainer', ['getContainerElement']);
    themeServiceSpy = jasmine.createSpyObj('ThemeService', ['setColorschemesOptions']);
    seoSpy = jasmine.createSpyObj('SeoService', ['setMetaDescription', 'setMetaTitle']);
    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'pipe']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get', 'set']);

    cookieServiceSpy.get.and.returnValue('light-theme');
    translateSpy.instant.and.returnValue({ CONTENT: 'desc', TITLE: 'title' });
    overlayContainerSpy.getContainerElement.and.returnValue(document.createElement('div'));
    storeSpy.pipe.and.returnValue(of('en'));

    const authUserServiceMock = {
      authUser: authUserSignal.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: TranslateService, useValue: translateSpy },
        { provide: SeoService, useValue: seoSpy },
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceMock },
        { provide: OverlayContainer, useValue: overlayContainerSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: ThemeService, useValue: themeServiceSpy },
        { provide: DateAdapter, useValue: { setLocale: jasmine.createSpy() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch setLanguage when authUser emits', () => {
    authUserSignal.update(prev => ({ ...prev, locale: 'es', theme: 'dark-theme' }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ language: 'es' }));
  });

  it('should call seoService and reset theme when authUser emits', () => {
    authUserSignal.update(prev => ({ ...prev, locale: 'es', theme: 'dark-theme' }));
    fixture.detectChanges();

    expect(seoSpy.setMetaDescription).toHaveBeenCalledWith('desc');
    expect(seoSpy.setMetaTitle).toHaveBeenCalledWith('title');
    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ language: 'es' }));
  });
});
