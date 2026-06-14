import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { AuthState } from '../../store/reducers/auth.reducers';
import { IError } from '../../interfaces/common';
import { FirebaseService } from '../../services/firebase.service';
import { NavigationService } from '../../services/navigation.service';
import { DEFAULT_LOCALE } from '../../util/dates';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  let error$: Subject<IError | undefined>;
  let response$: Subject<any>;
  let action$: Subject<void>;

  let storeSpy: jasmine.SpyObj<Store<AuthState>>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let firebaseServiceSpy: jasmine.SpyObj<FirebaseService>;

  beforeEach(async () => {
    error$ = new Subject<IError | undefined>();
    response$ = new Subject<any>();
    action$ = new Subject<void>();

    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'pipe']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    firebaseServiceSpy = jasmine.createSpyObj('FirebaseService', ['sendPasswordResetEmail']);

    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return error$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    toastServiceSpy.show.and.returnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => of(void 0),
    });

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    error$.complete();
    response$.complete();
    action$.complete();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeTruthy();
  });

  it('should call toast.error when errorMessage emits', () => {
    error$.next({ message: 'My error!' });
    fixture.detectChanges();

    expect(toastServiceSpy.show).toHaveBeenCalledWith('My error!', 'error');
  });

  it('should show toast and navigate when response emits', () => {
    response$.next({ message: 'OK', toastType: 'success' });
    fixture.detectChanges();

    action$.next();

    expect(toastServiceSpy.show).toHaveBeenCalledWith('OK', 'success', 5000, { actionType: 'button' });
    expect(routerSpy.navigate).toHaveBeenCalledWith([DEFAULT_LOCALE, 'auth']);
  });

  it('should request a password reset and dispatch signupSuccess', async () => {
    firebaseServiceSpy.sendPasswordResetEmail.and.resolveTo();
    component.getForm.email.setValue(' test@example.com ');

    component.forgotPassword();
    await fixture.whenStable();

    expect(firebaseServiceSpy.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      type: '[Auth] Signup Success',
    }));
  });
});
