import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainContentComponent } from './main-content.component';
import {
  AuthUserService,
  IAuthUser,
  initialAuthUser,
} from '@app/services/auth-user.service';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ToastService } from '@app/services/toast.service';
import { ISendMessage } from '../../../main';
import { ISocialLink } from '../main';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { GoogleMapStubComponent } from '@app/util/stub/google-map-stub.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { provideAppIcons } from '@app/util/app-icons.provider';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { CatalogueStore } from '@app/store/catalogue.store';
import { MainStore } from '@app/store/main.store';
import { NavigationService } from '@app/services/navigation.service';

describe('MainContentComponent', () => {
  let component: MainContentComponent;
  let fixture: ComponentFixture<MainContentComponent>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  let catalogueStoreSpy: {
    data: ReturnType<typeof signal>;
    getAllHome: Mock;
  };
  let mainStoreSpy: {
    response: ReturnType<typeof signal>;
    error: ReturnType<typeof signal>;
    isLoading: ReturnType<typeof signal>;
    create: Mock;
    clean: Mock;
  };

  const authUserSignal = signal<IAuthUser>(initialAuthUser);
  let authUserServiceSpy: Pick<AuthUserService, 'authUser'>;
  let toastServiceSpy: {
    show: Mock;
  };
  let bottomSheetSpy: Pick<MatBottomSheet, 'open'> & {
    open: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      },
    );
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    catalogueStoreSpy = {
      data: signal<any>(undefined),
      getAllHome: vi.fn().mockName('getAllHome'),
    };
    mainStoreSpy = {
      response: signal<any>(undefined),
      error: signal<any>(undefined),
      isLoading: signal<any>(false),
      create: vi.fn().mockName('create'),
      clean: vi.fn().mockName('clean'),
    };

    authUserServiceSpy = {
      authUser: authUserSignal.asReadonly(),
    };
    toastServiceSpy = {
      show: vi.fn().mockName('ToastService.show'),
    };
    bottomSheetSpy = {
      open: vi.fn().mockName('MatBottomSheet.open'),
    };

    await TestBed.configureTestingModule({
      imports: [MainContentComponent, GoogleMapStubComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: MainStore, useValue: mainStoreSpy },
        { provide: CatalogueStore, useValue: catalogueStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: MatBottomSheet, useValue: bottomSheetSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);
    translateService.setTranslation(DEFAULT_LOCALE, {
      TREATMENTS: [
        {
          TITLE: 'Treatment Title',
          CONTENT: 'Treatment Content',
        },
      ],
    });

    fixture = TestBed.createComponent(MainContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate form with auth user signal', () => {
    authUserSignal.update((prev) => ({
      ...prev,
      email: 'test@example.com',
      displayName: 'John Doe',
      isDarkMode: true,
    }));
    fixture.detectChanges();

    expect(component.getForm.email.value).toBe('test@example.com');
    expect(component.getForm.name.value).toBe('John Doe');
    expect(component.isDarkMode()).toBe(true);
  });

  it('should dispatch SendMessage action when form is valid', () => {
    component.form.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test Body',
    });

    component.sendEmail();

    expect(mainStoreSpy.create).toHaveBeenCalledWith(
      component.form.value as ISendMessage,
    );
  });

  it('should not dispatch SendMessage action when form is invalid', () => {
    component.form.patchValue({
      name: '',
      email: 'invalid-email',
      subject: '',
      body: '',
    });

    component.sendEmail();

    expect(mainStoreSpy.create).not.toHaveBeenCalled();
  });

  it('should update currentIndex signal when moveForwardSlide is called', () => {
    component.slides = [
      { id: '1', image: 'img1.jpg', order: 0 },
      { id: '2', image: 'img2.jpg', order: 1 },
    ];

    expect(component.currentIndex()).toBe(0);

    component['moveForwardSlide']();
    expect(component.currentIndex()).toBe(1);

    component['moveForwardSlide']();
    expect(component.currentIndex()).toBe(0);
  });

  it('should check if current slide index matches', () => {
    component.currentIndex.set(1);
    expect(component.isCurrentSlideIndex(1)).toBe(true);
    expect(component.isCurrentSlideIndex(0)).toBe(false);
  });

  it('should navigate to biab treatment', () => {
    component.goToTreatment('biab');
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'home',
      'biab-treatment',
      'treatment',
    ]);
  });

  it('should not navigate for other treatments', () => {
    component.goToTreatment('other');
    expect(navigationServiceSpy.navigate).not.toHaveBeenCalled();
  });

  it('should update social icon on hover', () => {
    const social: ISocialLink = {
      name: 'WHATSAPP',
      delay: '0ms',
      href: '',
      svgIcon: 'WHATSAPP-NO-COLOR',
    };
    component.onHover(social, true);
    expect(social.svgIcon).toBe('WHATSAPP');

    component.onHover(social, false);
    expect(social.svgIcon).toBe('WHATSAPP-NO-COLOR');
  });

  it('should update filter signal when filterBy is called', () => {
    const group = { id: '1', name: 'Group 1', order: 1 };

    component.filterBy(group);
    expect(component.filter()).toBe(group);

    component.filterBy(undefined);
    expect(component.filter()).toBeUndefined();
  });

  it('should populate groups signal from translations', () => {
    fixture.detectChanges();

    expect(component.groups()).toBeDefined();
    expect(component.groups().length).toBe(1);
  });
});
