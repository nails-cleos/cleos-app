import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { Store } from '@ngrx/store';
import { Auth } from '@angular/fire/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { clean } from '../../store/auth.actions';
import { AppState } from '../../store/app.states';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  let state$: Subject<any>;
  let action$: Subject<void>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let authSpy: jasmine.SpyObj<Auth>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    state$ = new Subject<any>();
    action$ = new Subject<void>();

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    authSpy = jasmine.createSpyObj('Auth', ['sendPasswordResetEmail']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['error', 'show']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    storeSpy.select.and.returnValue(state$.asObservable());
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
    state$.complete();
    action$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and dispatch clean on ngOnInit', () => {
    component.ngOnInit();
    expect(component.form).toBeDefined();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should unsubscribe on ngOnDestroy', () => {
    const sub = state$.subscribe();
    component.subscription = sub;
    spyOn(sub, 'unsubscribe');
    component.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalled();
  });

  it('should show toast on error state', () => {
    const errorState = { errorMessage: 'Something went wrong' };
    state$.next(errorState);
    expect(toastServiceSpy.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('should show toast and navigate on success state', () => {
    const successState = { response: { message: 'Success!', toastType: 'success' } };
    state$.next(successState);

    expect(toastServiceSpy.show).toHaveBeenCalledWith('Success!', 'success', 5000, 'button');

    action$.next();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'auth']);
  });
});
