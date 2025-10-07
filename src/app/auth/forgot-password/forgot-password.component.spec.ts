import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { Store } from '@ngrx/store';
import { Auth } from '@angular/fire/auth';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { UntypedFormBuilder } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import * as fromActionsLogin from '../../store/auth.actions';
import firebaseAuth from '@firebase/auth';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let mockStore: any;
  let mockAuth: any;
  let mockToastService: any;
  let mockRouter: any;
  let storeSubject: Subject<any>;

  beforeEach(async () => {
    storeSubject = new Subject<any>();

    mockStore = {
      select: jasmine.createSpy('select').and.returnValue(storeSubject.asObservable()),
      dispatch: jasmine.createSpy('dispatch'),
    };
    mockAuth = {};
    mockToastService = {
      error: jasmine.createSpy('error'),
      show: jasmine.createSpy('show').and.returnValue({ onAction: () => of(true) }),
    };
    mockRouter = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: Auth, useValue: mockAuth },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
        UntypedFormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and dispatch clean on ngOnInit', () => {
    component.ngOnInit();
    expect(component.form).toBeDefined();
    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsLogin.Clean));
  });

  it('should unsubscribe on ngOnDestroy', () => {
    const sub = storeSubject.subscribe();
    component.subscription = sub;
    spyOn(sub, 'unsubscribe');
    component.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalled();
  });

  it('should show toast on error state', () => {
    const errorState = { errorMessage: 'Something went wrong' };
    storeSubject.next(errorState);
    expect(mockToastService.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('should show toast and navigate on success state', () => {
    const successState = { response: { message: 'Success!', toastType: 'success' } };
    storeSubject.next(successState);

    expect(mockToastService.show).toHaveBeenCalledWith('Success!', 'success', 5000, 'button');
    // simulate onAction subscription
    mockToastService.show().onAction().subscribe(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith([component.language, 'auth']);
    });
  });

  it('should handle empty email gracefully', fakeAsync(() => {
    component.form.get('email')?.setValue(''); // empty email
    const sendSpy = spyOn<any>(firebaseAuth, 'sendPasswordResetEmail');
    component.forgotPassword();
    tick();
    expect(sendSpy).not.toHaveBeenCalled();
  }));
});
