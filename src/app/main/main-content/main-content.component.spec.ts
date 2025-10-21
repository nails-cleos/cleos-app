import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { MainContentComponent } from './main-content.component';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthUserService } from '../../services/auth-user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withJsonpSupport } from '@angular/common/http';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { MainContentService } from '../main-content.service';
import { ToastService } from '../../services/toast.service';
import { ISocialLink } from '../../interfaces/main';
import { clean, sendMessage } from '../../store/main.actions';
import { AppState } from '../../store/app.states';

describe('MainContentComponent', () => {
  let component: MainContentComponent;
  let fixture: ComponentFixture<MainContentComponent>;

  let state$: Subject<any>;
  let authUser$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let bottomSheetSpy: jasmine.SpyObj<MatBottomSheet>;
  let mainContentServiceSpy: jasmine.SpyObj<MainContentService>;

  let translateService: TranslateService;

  beforeEach(async () => {
    state$ = new Subject<any>();
    authUser$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj<Store<AppState>>('Store', ['dispatch', 'select']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    toastServiceSpy = jasmine.createSpyObj<ToastService>('ToastService', ['show', 'error']);
    bottomSheetSpy = jasmine.createSpyObj<MatBottomSheet>('MatBottomSheet', ['open']);
    mainContentServiceSpy = jasmine.createSpyObj<MainContentService>('MainContentService', ['configure']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUser$.asObservable(),
    });

    storeSpy.select.and.returnValue(state$);

    await TestBed.configureTestingModule({
      imports: [MainContentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: MatBottomSheet, useValue: bottomSheetSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MainContentService, useValue: mainContentServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        provideNoopAnimations(),
        provideHttpClient(withJsonpSupport()),
      ],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');

    fixture = TestBed.createComponent(MainContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    state$.complete();
    authUser$.complete();
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should initialize form with authenticated user data', () => {
    authUser$.next({
      isAuthenticated: true,
      email: 'user@test.com',
      displayName: 'John Doe',
      isDarkMode: false,
    });

    expect(component.form).toBeDefined();
    expect(component.email.value).toBe('user@test.com');
    expect(component.name.value).toBe('John Doe');
  });

  it('should dispatch Clean action on init', () => {
    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch SendMessage action when form is valid', () => {
    const message = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test Body',
    };
    component.form.patchValue(message);
    expect(component.form.valid).toBeTrue();

    component.sendEmail();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(sendMessage({ sendMessage: component.form.value }));
  });

  it('should not dispatch SendMessage action when form is invalid', () => {
    storeSpy.dispatch.calls.reset();
    component.form.patchValue({
      name: '',
      email: 'invalid-email',
      subject: '',
      body: '',
    });

    component.sendEmail();

    const sendMessageCalls = storeSpy.dispatch.calls.all().filter(
      (call: any) => call.args[0] instanceof sendMessage,
    );
    expect(sendMessageCalls.length).toBe(0);
  });

  it('should check if current slide index matches', () => {
    component.currentIndex = 1;

    expect(component.isCurrentSlideIndex(1)).toBeTrue();
    expect(component.isCurrentSlideIndex(0)).toBeFalse();
  });

  it('should navigate to biab treatment', () => {
    component.goToTreatment('biab');

    expect(routerSpy.navigate).toHaveBeenCalledWith([translateService.currentLang, 'biab', 'treatment']);
  });

  it('should not navigate when treatment name is not biab', () => {
    component.goToTreatment('other');

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should update social icon on hover', () => {
    const social: ISocialLink = {
      name: 'WHATSAPP',
      delay: '1000ms',
      href: 'https://api.whatsapp.com/send',
      svgIcon: 'WHATSAPP-NO-COLOR',
    };

    component.onHover(social, true);
    expect(social.svgIcon).toBe('WHATSAPP');

    component.onHover(social, false);
    expect(social.svgIcon).toBe('WHATSAPP-NO-COLOR');
  });

  it('should filter works by treatment group', fakeAsync(() => {
    const group = { id: '1', name: 'Group 1', order: 1 };
    component.allWorks = [
      { title: '1', image: 'img1.jpg', group: { id: '1', name: 'Group 1', order: 1 } },
      { title: '2', image: 'img2.jpg', group: { id: '2', name: 'Group 2', order: 2 } },
      { title: '3', image: 'img3.jpg', group: { id: '1', name: 'Group 1', order: 1 } },
    ];

    component.filterBy(group);
    tick(500);

    expect(component.works.length).toBe(2);
    expect(component.works[0].group.id).toBe('1');
    expect(component.works[1].group.id).toBe('1');
  }));

  it('should show all works when filter is cleared', fakeAsync(() => {
    component.allWorks = [
      { title: '1', image: 'img1.jpg', group: { id: '1', name: 'Group 1', order: 1 } },
      { title: '2', image: 'img2.jpg', group: { id: '2', name: 'Group 2', order: 2 } },
    ];

    component.filterBy(undefined);
    tick(500);

    expect(component.works.length).toBe(2);
  }));

  it('should move to next slide in slider', () => {
    component.currentIndex = 0;
    component.slides = [
      { id: '1', image: 'img1.jpg', order: 0 },
      { id: '2', image: 'img2.jpg', order: 1 },
      { id: '3', image: 'img3.jpg', order: 2 },
    ];

    component['moveForwardSlide']();
    expect(component.currentIndex).toBe(1);

    component['moveForwardSlide']();
    expect(component.currentIndex).toBe(2);

    component['moveForwardSlide']();
    expect(component.currentIndex).toBe(0); // Loop back to start
  });

  it('should display error toast when error message is received', () => {
    state$.next({ errorMessage: 'Error occurred' });

    expect(toastServiceSpy.error).toHaveBeenCalledWith('Error occurred');
  });

  it('should display success toast when response is received', () => {
    state$.next({
      response: { message: 'Success', toastType: 'success' },
    });

    expect(toastServiceSpy.show).toHaveBeenCalledWith('Success', 'success');
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component['subscription'] as any, 'unsubscribe');

    component.ngOnDestroy();

    expect(component['subscription']?.unsubscribe).toHaveBeenCalled();
  });

  it('should set dark mode based on auth user', () => {
    authUser$.next({
      isAuthenticated: false,
      email: 'test@test.com',
      displayName: 'Test',
      isDarkMode: true,
    });

    expect(component.isDark).toBeTrue();

    authUser$.next({
      isAuthenticated: false,
      email: 'test@test.com',
      displayName: 'Test',
      isDarkMode: false,
    });

    expect(component.isDark).toBeFalse();
  });

  it('should generate correct treatment animation delay', () => {
    const animation1 = component.setTreatmentAnimation(0);
    const animation2 = component.setTreatmentAnimation(1);

    expect(animation1).toBeDefined();
    expect(animation2).toBeDefined();
  });
});
