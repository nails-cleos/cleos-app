import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainContentComponent } from './main-content.component';
import { Store } from '@ngrx/store';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { sendMessage } from '../../store/actions/main.actions';
import { ISendMessage } from '../../../main';
import { ISocialLink } from '../main';
import { BehaviorSubject } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { MainState } from '../../store/reducers/main.reducers';
import { GoogleMapStubComponent } from '../../shared/google-map/google-map-stub.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { provideAppIcons } from '../../util/app-icons.provider';

describe('MainContentComponent', () => {
  let component: MainContentComponent;
  let fixture: ComponentFixture<MainContentComponent>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);
  let response$: BehaviorSubject<any>;
  let error$: BehaviorSubject<any>;
  let catalogue$: BehaviorSubject<any>;
  let isLoading$: BehaviorSubject<boolean>;

  let storeSpy: jasmine.SpyObj<Store<MainState>>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let bottomSheetSpy: jasmine.SpyObj<MatBottomSheet>;

  let translateService: TranslateService;

  beforeEach(async () => {
    response$ = new BehaviorSubject(undefined);
    error$ = new BehaviorSubject(undefined);
    catalogue$ = new BehaviorSubject([]);
    isLoading$ = new BehaviorSubject<boolean>(false);

    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'pipe', 'select']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    bottomSheetSpy = jasmine.createSpyObj('MatBottomSheet', ['open']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return response$.asObservable();
        case 2:
          return error$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });
    storeSpy.select.and.callFake(() => {
      const callIndex = storeSpy.select.calls.count();
      return callIndex === 1 ? catalogue$.asObservable() : isLoading$.asObservable();
    });

    await TestBed.configureTestingModule({
      imports: [MainContentComponent, GoogleMapStubComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: MatBottomSheet, useValue: bottomSheetSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');
    translateService.setTranslation('en-GB', {
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

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      sendMessage({ sendMessage: component.form.value as ISendMessage }),
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

    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: '[Main] Send Message' }));
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
    expect(routerSpy.navigate).toHaveBeenCalledWith([translateService.getCurrentLang(), 'home', 'biab-treatment', 'treatment']);
  });

  it('should not navigate for other treatments', () => {
    component.goToTreatment('other');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
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
