import { Component, inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { Login, SignUpSuccess } from '../store/auth.actions';
import { AppState, selectAuthState } from '../store/app.states';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from '@angular/fire/auth';
import { VERIFICATION_EMAIL } from '../util/helper';
import { THEME } from '../util/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';
import { GoogleAuthProvider } from 'firebase/auth';
import { user } from 'rxfire/auth';
import { fetchSignInMethodsForEmail } from '@firebase/auth';
import { SharedModule } from '../shared/shared.module';
import { ToastService } from '../services/toast.service';
import { ResponseSuccess } from '../interfaces/common';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  imports: [SharedModule],
})
export class AuthComponent implements OnInit, OnDestroy {

  @Optional() private auth: Auth = inject(Auth);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private store: Store<AppState> = inject(Store<AppState>);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private toastService: ToastService = inject(ToastService);
  private cookieService: CookieService = inject(CookieService);
  private translate: TranslateService = inject(TranslateService);

  loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    code: [''],
    displayName: [''],
  });

  code: string | null = null;
  language: string = this.translate.currentLang;
  showForm: boolean = false;
  status: string = 'init';
  tos: string = `${ environment.appServer }/${ this.language }/term-and-conditions`;
  privacyPolicy: string = `${ environment.appServer }/${ this.language }/privacy`;

  private subscription?: Subscription;
  private getState: Observable<any> = this.store.select(selectAuthState);
  private authSubscription?: Subscription;

  get onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password, displayName } = this.loginForm.value;
      if (displayName) {
        createUserWithEmailAndPassword(this.auth, email, password).catch(err => {
          console.error('An error happen trying to createUserWithEmailAndPassword', err);
          switch (err.code) {
            case 'auth/invalid-email':
              this.loginForm.get('email')?.setErrors({ email: true });
              break;
            case 'auth/weak-password':
              this.loginForm.get('password')?.setErrors({ week: true });
              break;
            default:
              this.loginForm.get('password')?.setErrors({ error: err.message });
              break;
          }
        });
      } else {
        signInWithEmailAndPassword(this.auth, email, password).catch(err => {
          console.error('An error happen trying to signInWithEmailAndPassword', err);
          if (err.code === 'auth/wrong-password') {
            this.loginForm.get('password')?.setErrors({ wrong: true });
          } else {
            this.loginForm.get('password')?.setErrors({ error: err.message });
          }
        });
      }
    }
    return;
  }

  get loginWithGoogle(): void {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider).catch(err => console.error('An error happen trying to signInWithPopup', err));
    return;
  }

  get validateEmail(): void {
    fetchSignInMethodsForEmail(this.auth, this.loginForm.get('email')?.value).then(response => {
      const displayNameControl = this.loginForm.get('displayName');
      if (!response.length) {
        displayNameControl?.setValidators([Validators.required]);
      } else {
        displayNameControl?.setValue('');
        displayNameControl?.clearValidators();
      }
      displayNameControl?.updateValueAndValidity();
      this.status = response.join('|');
    }).catch(err => console.error('An error happen trying to fetchSignInMethodsForEmail', err));
    return;
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.code = this.route.snapshot.queryParamMap.get('code');
    this.loginForm.get('code')?.setValue(this.code);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  private clean = (): void => this.store.dispatch(new fromActionsLogin.Clean());

  private subscribe = (): void => {
    this.loginForm.get('code')?.valueChanges.subscribe(value => {
      if (value) {
        localStorage.setItem('CODE', value);
      }
    });
    this.loginForm.get('email')?.valueChanges.subscribe(() => {
      if (this.status !== 'init') {
        this.status = 'init';
      }
    });
    this.subscription = this.getState.subscribe((state) => {
      if (state.isAuthenticated) {
        let returnUrl;
        if (state.queryParams?.state) {
          returnUrl = JSON.parse(atob(state.queryParams.state))?.returnUrl;
        }
        if (!state.redirect && !returnUrl) {
          this.store.dispatch(
            new fromActionsLogin.Redirect(),
          );
        }
      }
      if (!state.subErrors || !state.subErrors.length) {
        if (state.errorMessage) {
          this.toastService.error(state.errorMessage);
        } else if (state.response) {
          const response: ResponseSuccess = state.response;
          const toastRef = this.toastService.show(response.message, response.toastType, 5000, 'button');
          toastRef.onAction().subscribe(() => this.clean());
        }
      }
    });
    this.authSubscription = user(this.auth).subscribe(user => {
      if (user) {
        const displayName = this.loginForm.get('displayName')?.value;
        if (displayName) {
          updateProfile(user, { displayName });
        }
        if (!user.emailVerified && !this.cookieService.get(VERIFICATION_EMAIL)) {
          sendEmailVerification(user).then(() => {
            const message = this.translate.instant('AUTH.ACTIVATE_ACCOUNT.MESSAGE');
            this.store.dispatch(
              new SignUpSuccess(message),
            );
            this.cookieService.set(VERIFICATION_EMAIL, 'sent');
          }).catch(e => console.error(`Error sending email verification. ${ e }`));
        } else {
          user.getIdToken().then(idToken => {
            localStorage.removeItem('CODE');
            this.store.dispatch(
              new Login(idToken, this.route.snapshot.queryParams, this.cookieService.get(THEME),
                localStorage.getItem('CODE')),
            );
          });
        }
      }
    });
  };
}
