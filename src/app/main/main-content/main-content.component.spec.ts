import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainContentComponent } from './main-content.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ToastService } from '../../services/toast.service';
import { ISendMessage } from '../../../main';
import { ISocialLink } from '../main';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { GoogleMapStubComponent } from '../../shared/google-map/google-map-stub.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { provideAppIcons } from '../../util/app-icons.provider';
import { DEFAULT_LOCALE } from '../../util/dates';
import { CatalogueStore } from '../../store/catalogue.store';
import { MainStore } from '../../store/main.store';
import { NavigationService } from '../../services/navigation.service';

describe('MainContentComponent', () => {
  let component: MainContentComponent;
  let fixture: ComponentFixture<MainContentComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let catalogueStoreSpy: {
    data: ReturnType<typeof signal>;
    getAllHome: jasmine.Spy;
  };
  let mainStoreSpy: {
    response: ReturnType<typeof signal>;
    error: ReturnType<typeof signal>;
    isLoading: ReturnType<typeof signal>;
    create: jasmine.Spy;
    clean: jasmine.Spy;
  };

  const authUserSignal = signal<IAuthUser>(initialAuthUser);
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let bottomSheetSpy: jasmine.SpyObj<MatBottomSheet>;

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    catalogueStoreSpy = {
      data: signal<any>(undefined),
      getAllHome: jasmine.createSpy('getAllHome'),
    };
    mainStoreSpy = {
      response: signal<any>(undefined),
      error: signal<any>(undefined),
      isLoading: signal<any>(false),
      create: jasmine.createSpy('create'),
      clean: jasmine.createSpy('clean'),
    };

    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    bottomSheetSpy = jasmine.createSpyObj('MatBottomSheet', ['open']);

    await TestBed.configureTestingModule({
      imports: [MainContentComponent, GoogleMapStubComponent, TranslateModule.forRoot()],
      providers: [
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
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);
    translateService.setTranslation(DEFAULT_LOCALE, {
      TREATMENTS: [{
        TITLE: 'Treatment Title',
        CONTENT: 'Treatment Content',
      }],
    });

    fixture = TestBed.createComponent(MainContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate form with auth user signal', () => {
    authUserSignal.update(prev => ({ ...prev, email: 'test@example.com', displayName: 'John Doe', isDarkMode: true }));
    fixture.detectChanges();

    expect(component.getForm.email.value).toBe('test@example.com');
    expect(component.getForm.name.value).toBe('John Doe');
    expect(component.isDarkMode()).toBeTrue();
  });

  it('should dispatch SendMessage action when form is valid', () => {
    component.form.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test Body',
    });

    component.sendEmail();

    expect(mainStoreSpy.create).toHaveBeenCalledWith(component.form.value as ISendMessage);
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
    expect(component.isCurrentSlideIndex(1)).toBeTrue();
    expect(component.isCurrentSlideIndex(0)).toBeFalse();
  });

  it('should navigate to biab treatment', () => {
    component.goToTreatment('biab');
    expect(navigationServiceSpy.navigate)
      .toHaveBeenCalledWith(['home', 'biab-treatment', 'treatment']);
  });

  it('should not navigate for other treatments', () => {
    component.goToTreatment('other');
    expect(navigationServiceSpy.navigate).not.toHaveBeenCalled();
  });

  it('should update social icon on hover', () => {
    const social: ISocialLink = { name: 'WHATSAPP', delay: '0ms', href: '', svgIcon: 'WHATSAPP-NO-COLOR' };
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
