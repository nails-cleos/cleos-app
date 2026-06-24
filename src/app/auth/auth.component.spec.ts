import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FirebaseService } from '../services/firebase.service';
import { signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { ToastService } from '../services/toast.service';
import { CookieService } from 'ngx-cookie-service';
import { VERIFICATION_EMAIL } from '../util/helper';
import { AuthStore } from '../store/auth.store';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  let authStoreSpy: {
    isAuthenticated: ReturnType<typeof signal>;
    redirect: ReturnType<typeof signal>;
    queryParams: ReturnType<typeof signal>;
    error: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    authRedirect: jasmine.Spy;
    login: jasmine.Spy;
    signupSuccess: jasmine.Spy;
    setCurrentCode: jasmine.Spy;
    clearResponse: jasmine.Spy;
    clean: jasmine.Spy;
  };

  let action$: Subject<void>;

  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let firebaseServiceSpy: jasmine.SpyObj<FirebaseService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let cookieService: CookieService;

  beforeEach(async () => {
    authStoreSpy = {
      isAuthenticated: signal(false),
      redirect: signal(false),
      queryParams: signal(undefined),
      error: signal(undefined),
      response: signal(undefined),
      authRedirect: jasmine.createSpy('authRedirect'),
      login: jasmine.createSpy('login'),
      signupSuccess: jasmine.createSpy('signupSuccess'),
      setCurrentCode: jasmine.createSpy('setCurrentCode'),
      clearResponse: jasmine.createSpy('clearResponse'),
      clean: jasmine.createSpy('clean'),
    };
    action$ = new Subject<void>();

    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        queryParams: {},
      },
      queryParamMap: of(convertToParamMap({})),
    });

    toastServiceSpy.show.and.returnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => of(void 0),
    });

    firebaseServiceSpy = jasmine.createSpyObj('FirebaseService', [
      'signUp', 'signIn', 'signInWithGoogle', 'updateProfile', 'sendVerificationEmail', 'fetchSignInMethods',
      'getIdToken',
    ]);

    (firebaseServiceSpy as any).user = signal(null);

    await TestBed.configureTestingModule({
      imports: [AuthComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    cookieService = TestBed.inject(CookieService);
    cookieService.deleteAll('/');
    fixture.detectChanges();
  });

  afterEach(() => {
    action$.complete();
    cookieService.deleteAll('/');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call signUp on submit when displayName exists', async () => {
    component.getForm.email.setValue('test@example.com');
    component.getForm.password.setValue('123456');
    component.getForm.displayName.setValue('Test User');

    firebaseServiceSpy.signUp.and.returnValue(Promise.resolve({} as any));

    component.onSubmit();

    expect(firebaseServiceSpy.signUp).toHaveBeenCalledWith('test@example.com', '123456');
  });

  it('should call signIn on submit when displayName is undefined', async () => {
    component.getForm.email.setValue('test@example.com');
    component.getForm.password.setValue('123456');
    component.getForm.displayName.setValue(undefined);

    firebaseServiceSpy.signIn.and.returnValue(Promise.resolve({} as any));

    component.onSubmit();

    expect(firebaseServiceSpy.signIn).toHaveBeenCalledWith('test@example.com', '123456');
  });

  it('should call signInWithGoogle when loginWithGoogle is invoked', async () => {
    firebaseServiceSpy.signInWithGoogle.and.returnValue(Promise.resolve({} as any));

    component.loginWithGoogle();

    expect(firebaseServiceSpy.signInWithGoogle).toHaveBeenCalled();
  });

  it('should call fetchSignInMethods and update displayName validators when validateEmail is invoked', async () => {
    firebaseServiceSpy.fetchSignInMethods.and.returnValue(Promise.resolve([]));

    const displayNameControl = component.getForm.displayName;
    displayNameControl.setValidators([]);
    displayNameControl.setValue(undefined);

    await component.validateEmail();

    expect(firebaseServiceSpy.fetchSignInMethods).toHaveBeenCalledWith(component.getForm.email.value);
    expect(displayNameControl.hasValidator(Validators.required)).toBeTrue();
    expect(component.statusSignal()).toBe('');
  });

  it('should clear displayName validators if fetchSignInMethods returns non-empty', async () => {
    firebaseServiceSpy.fetchSignInMethods.and.returnValue(Promise.resolve(['password']));

    const displayNameControl = component.getForm.displayName;
    displayNameControl.setValidators([Validators.required]);
    displayNameControl.setValue('test');

    await component.validateEmail();

    expect(firebaseServiceSpy.fetchSignInMethods).toHaveBeenCalledWith(component.getForm.email.value);
    expect(displayNameControl.hasValidator(Validators.required)).toBeFalse();
    expect(displayNameControl.value).toBeUndefined();
    expect(component.statusSignal()).toBe('password');
  });

  it('should process user correctly', fakeAsync(() => {
    const mockUser = { uid: '123', emailVerified: false } as any;
    component.getForm.displayName.setValue('Test User');

    firebaseServiceSpy.updateProfile.and.returnValue(Promise.resolve());
    firebaseServiceSpy.sendVerificationEmail.and.returnValue(Promise.resolve());
    firebaseServiceSpy.getIdToken = jasmine.createSpy().and.returnValue(Promise.resolve('id-token'));

    (component as any).processUser(mockUser);
    flushMicrotasks();

    expect(firebaseServiceSpy.updateProfile).toHaveBeenCalledWith({ displayName: 'Test User' });
    expect(firebaseServiceSpy.sendVerificationEmail).toHaveBeenCalled();
    expect(authStoreSpy.signupSuccess).toHaveBeenCalled();
  }));

  it('should dispatch login when processing a verified user', fakeAsync(() => {
    const mockUser = { uid: '123', emailVerified: true } as any;
    firebaseServiceSpy.getIdToken = jasmine.createSpy().and.returnValue(Promise.resolve('id-token'));

    (component as any).processUser(mockUser);
    flushMicrotasks();

    expect(firebaseServiceSpy.sendVerificationEmail).not.toHaveBeenCalled();
    expect(authStoreSpy.login).toHaveBeenCalledWith('id-token', undefined, '', {});
  }));

  it('should not dispatch login when verified user has no id token', fakeAsync(() => {
    const mockUser = { uid: '123', emailVerified: true } as any;
    firebaseServiceSpy.getIdToken = jasmine.createSpy().and.returnValue(Promise.resolve(null));

    (component as any).processUser(mockUser);
    flushMicrotasks();

    expect(authStoreSpy.login).not.toHaveBeenCalled();
  }));

  it('should login instead of sending verification email when verification cookie exists', fakeAsync(() => {
    const mockUser = { uid: '123', emailVerified: false } as any;
    cookieService.set(VERIFICATION_EMAIL, 'sent');
    firebaseServiceSpy.getIdToken = jasmine.createSpy().and.returnValue(Promise.resolve('id-token'));

    (component as any).processUser(mockUser);
    flushMicrotasks();

    expect(firebaseServiceSpy.sendVerificationEmail).not.toHaveBeenCalled();
    expect(authStoreSpy.login).toHaveBeenCalledWith('id-token', undefined, '', {});
  }));

  it('should map sign up invalid-email errors to the email control', fakeAsync(() => {
    component.getForm.email.setValue('test@example.com');
    component.getForm.password.setValue('123456');
    component.getForm.displayName.setValue('Test User');

    firebaseServiceSpy.signUp.and.returnValue(Promise.reject({ code: 'auth/invalid-email' }));

    component.onSubmit();
    flushMicrotasks();

    expect(component.getForm.email.hasError('email')).toBeTrue();
  }));

  it('should map sign in wrong-password errors to the password control', fakeAsync(() => {
    component.getForm.email.setValue('test@example.com');
    component.getForm.password.setValue('123456');
    component.getForm.displayName.setValue(undefined);

    firebaseServiceSpy.signIn.and.returnValue(Promise.reject({ code: 'auth/wrong-password' }));

    component.onSubmit();
    flushMicrotasks();

    expect(component.getForm.password.hasError('wrong')).toBeTrue();
  }));

  it('should clear auth state when the response toast action is used', () => {
    authStoreSpy.response.set({ message: 'OK', toastType: 'success' });
    fixture.detectChanges();

    action$.next();

    expect(authStoreSpy.clearResponse).toHaveBeenCalled();
  });

  it('should dispatch setCurrentCode when codeSignal changes', () => {
    const testCode = 'ABC123';
    component.getForm.code.setValue(testCode);

    fixture.detectChanges();

    expect(authStoreSpy.setCurrentCode).toHaveBeenCalledWith(testCode);
  });

  it('should show toast when errorSignal has message', () => {
    const mockError = { message: 'Some error' };
    authStoreSpy.error.set(mockError);

    fixture.detectChanges();

    authStoreSpy.error.set(mockError);
    fixture.detectChanges();

    expect(toastServiceSpy.show).toHaveBeenCalledWith('Some error', 'error');
  });
});
