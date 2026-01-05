import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { Store } from '@ngrx/store';
import { Auth } from '@angular/fire/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { AuthState } from '../../store/reducers/auth.reducers';
import { IError } from '../../interfaces/common';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  let error$: Subject<IError | undefined>;
  let response$: Subject<any>;
  let action$: Subject<void>;

  let storeSpy: jasmine.SpyObj<Store<AuthState>>;
  let authSpy: jasmine.SpyObj<Auth>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    error$ = new Subject<IError | undefined>();
    response$ = new Subject<any>();
    action$ = new Subject<void>();

    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'pipe']);
    authSpy = jasmine.createSpyObj('Auth', ['sendPasswordResetEmail']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['error', 'show']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

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
        { provide: Auth, useValue: authSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');

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

    expect(toastServiceSpy.error).toHaveBeenCalledWith('My error!');
  });

  it('should show toast and navigate when response emits', () => {
    response$.next({ message: 'OK', toastType: 'success' });
    fixture.detectChanges();

    action$.next();

    expect(toastServiceSpy.show).toHaveBeenCalledWith('OK', 'success', 5000, 'button');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'auth']);
  });
});
