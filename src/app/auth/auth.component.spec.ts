import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthState } from '../store/reducers/auth.reducers';
import { FirebaseService } from '../services/firebase.service';
import { signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { ToastService } from '../services/toast.service';
import { CookieService } from 'ngx-cookie-service';
import { VERIFICATION_EMAIL } from '../util/helper';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  let currentCode$: BehaviorSubject<any>;
  let isAuthenticated$: BehaviorSubject<any>;
  let redirect$: BehaviorSubject<any>;
  let queryParams$: BehaviorSubject<any>;
  let error$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;
  let action$: Subject<void>;

  let storeSpy: jasmine.SpyObj<Store<AuthState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let firebaseServiceSpy: jasmine.SpyObj<FirebaseService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let cookieService: CookieService;

  beforeEach(async () => {
    currentCode$ = new BehaviorSubject(undefined);
    isAuthenticated$ = new BehaviorSubject(false);
    redirect$ = new BehaviorSubject(undefined);
    queryParams$ = new BehaviorSubject(undefined);
    error$ = new BehaviorSubject(undefined);
    response$ = new BehaviorSubject(undefined);
    action$ = new Subject<void>();

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        queryParams: {},
      },
    });

    toastServiceSpy.show.and.returnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => of(void 0),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return currentCode$.asObservable();
        case 2:
          return isAuthenticated$.asObservable();
        case 3:
          return redirect$.asObservable();
        case 4:
          return queryParams$.asObservable();
        case 5:
          return error$.asObservable();
        case 6:
          return response$.asObservable();
        default:
          return of(undefined);
      }
    });

    firebaseServiceSpy = jasmine.createSpyObj('FirebaseService', [
      'signUp', 'signIn', 'signInWithGoogle', 'updateProfile', 'sendVerificationEmail', 'fetchSignInMethods',
      'getIdToken',
    ]);

    (firebaseServiceSpy as any).user = signal(null);

    await TestBed.configureTestingModule({
      imports: [AuthComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    cookieService = TestBed.inject(CookieService);
    fixture.detectChanges();
  });

  afterEach(() => {
    currentCode$.complete();
    isAuthenticated$.complete();
    redirect$.complete();
    queryParams$.complete();
    error$.complete();
    response$.complete();
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
    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      type: '[Auth] Signup Success',
    }));
  }));

  it('should dispatch login when processing a verified user', fakeAsync(() => {
    const mockUser = { uid: '123', emailVerified: true } as any;
    firebaseServiceSpy.getIdToken = jasmine.createSpy().and.returnValue(Promise.resolve('id-token'));

    (component as any).processUser(mockUser);
    flushMicrotasks();

    expect(firebaseServiceSpy.sendVerificationEmail).not.toHaveBeenCalled();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      type: '[Auth] Login',
      token: 'id-token',
    }));
  }));

  it('should not dispatch login when verified user has no id token', fakeAsync(() => {
    const mockUser = { uid: '123', emailVerified: true } as any;
    firebaseServiceSpy.getIdToken = jasmine.createSpy().and.returnValue(Promise.resolve(null));

    (component as any).processUser(mockUser);
    flushMicrotasks();

    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({
      type: '[Auth] Login',
    }));
  }));

  it('should login instead of sending verification email when verification cookie exists', fakeAsync(() => {
    const mockUser = { uid: '123', emailVerified: false } as any;
    cookieService.set(VERIFICATION_EMAIL, 'sent');
    firebaseServiceSpy.getIdToken = jasmine.createSpy().and.returnValue(Promise.resolve('id-token'));

    (component as any).processUser(mockUser);
    flushMicrotasks();

    expect(firebaseServiceSpy.sendVerificationEmail).not.toHaveBeenCalled();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      type: '[Auth] Login',
      token: 'id-token',
    }));
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
    response$.next({ message: 'OK', toastType: 'success' });
    fixture.detectChanges();

    action$.next();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      type: '[Auth] Clean',
    }));
  });

  it('should dispatch setCurrentCode when codeSignal changes', () => {
    const testCode = 'ABC123';
    component.getForm.code.setValue(testCode);

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      type: '[Auth] Set current code',
      code: testCode,
    }));
  });

  it('should show toast when errorSignal has message', () => {
    const mockError = { message: 'Some error' };
    error$.next(mockError);

    fixture.detectChanges();

    error$.next(mockError);
    fixture.detectChanges();

    expect(toastServiceSpy.show).toHaveBeenCalledWith('Some error', 'error');
  });
});
