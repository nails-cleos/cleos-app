import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { Store } from '@ngrx/store';
import { cleanAuth, login, redirect, setCurrentCode, signupSuccess } from '../store/auth.actions';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { VERIFICATION_EMAIL } from '../util/helper';
import { THEME } from '../util/theme';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { ToastService } from '../services/toast.service';
import {
  getAuthErrorPipe,
  getAuthResponsePipe,
  getCurrentCodePipe,
  getIsAuthenticatedPipe,
  getQueryParamsPipe,
  getRedirectPipe,
} from '../store/selectors/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthState } from '../store/reducers/auth.reducers';
import { EnvService } from '../services/env.service';
import { FirebaseService } from '../services/firebase.service';
import { User } from 'firebase/auth';

type AuthForm = {
  email: FormControl<string>;
  password: FormControl<string>;
  code: FormControl<string | undefined>;
  displayName: FormControl<string | undefined>;
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  private readonly env: EnvService = inject(EnvService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly store: Store<AuthState> = inject(Store<AuthState>);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly cookieService: CookieService = inject(CookieService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly firebaseService = inject(FirebaseService);

  private currentCode$ = this.store.pipe(getCurrentCodePipe);
  private isAuthenticated$ = this.store.pipe(getIsAuthenticatedPipe);
  private redirect$ = this.store.pipe(getRedirectPipe);
  private queryParams$ = this.store.pipe(getQueryParamsPipe);

  private error$ = this.store.pipe(getAuthErrorPipe);
  private response$ = this.store.pipe(getAuthResponsePipe);

  private isAuthenticatedSignal = toSignal(this.isAuthenticated$);
  private redirectSignal = toSignal(this.redirect$);
  private queryParamsSignal = toSignal(this.queryParams$);
  private errorSignal = toSignal(this.error$);
  private responseSignal = toSignal(this.response$);
  private codeSignal = toSignal(this.currentCode$);

  statusSignal = signal('init');

  form: FormGroup<AuthForm> = this.formBuilder.group<AuthForm>({
    email: this.formBuilder.control('', {
      validators: [Validators.required, Validators.email],
    }),
    password: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    code: this.formBuilder.control(this.codeSignal()),
    displayName: this.formBuilder.control(undefined),
  });
  private emailSignal = toSignal(this.getForm.email.valueChanges, { initialValue: '' });
  private currentCodeSignal = toSignal(this.getForm.code.valueChanges, { initialValue: undefined });

  language: string = this.translate.getCurrentLang();
  showForm: boolean = false;
  tos: string = `${this.env.appServer}/${this.language}/term-and-conditions`;
  privacyPolicy: string = `${this.env.appServer}/${this.language}/privacy`;

  constructor() {
    effect(() => {
      if (this.isAuthenticatedSignal()) {
        const queryParams = this.queryParamsSignal();
        let returnUrl;
        if (queryParams?.state) {
          returnUrl = JSON.parse(atob(queryParams.state))?.returnUrl;
        }
        if (!this.redirectSignal() && !returnUrl) {
          this.store.dispatch(redirect());
        }
      }
    });
    effect(() => {
      const error = this.errorSignal();
      if (!error?.subErrors || !error.subErrors.length) {
        if (error?.message) {
          this.toastService.show(error.message, 'error');
        }
      }
    });
    effect(() => {
      const response = this.responseSignal();
      if (response?.message) {
        const actionType = 'button';
        const toastRef = this.toastService.show(response.message, response.toastType, 5000, { actionType });
        toastRef.onAction().subscribe(() => this.store.dispatch(cleanAuth()));
      }
    });

    effect(() => {
      const user = this.firebaseService.user();
      if (!user) {
        return;
      }

      untracked(() => this.processUser(user));
    });

    effect(() => {
      const code = this.currentCodeSignal();
      if (code) {
        this.store.dispatch(setCurrentCode({ code }));
      }
    });

    effect(() => {
      this.emailSignal();
      this.statusSignal.set('init');
    });
  }

  get getForm(): AuthForm {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const displayName = this.getForm.displayName.value;
      if (displayName) {
        this.firebaseService.signUp(this.getForm.email.value, this.getForm.password.value)
          .catch(err => {
            console.error('An error happen trying to createUserWithEmailAndPassword', err);
            switch (err.code) {
              case 'auth/invalid-email':
                this.getForm.email.setErrors({ email: true });
                break;
              case 'auth/weak-password':
                this.getForm.password.setErrors({ weak: true });
                break;
              default:
                this.getForm.password.setErrors({ error: err.message });
                break;
            }
          });
      } else {
        this.firebaseService.signIn(this.getForm.email.value, this.getForm.password.value).catch(err => {
          console.error('An error happen trying to signInWithEmailAndPassword', err);
          if (err.code === 'auth/wrong-password') {
            this.getForm.password.setErrors({ wrong: true });
          } else {
            this.getForm.password.setErrors({ error: err.message });
          }
        });
      }
    }
  }

  loginWithGoogle(): void {
    this.firebaseService.signInWithGoogle()
      .catch(err => console.error('An error happen trying to signInWithPopup', err));
  }

  validateEmail(): void {
    this.firebaseService.fetchSignInMethods(this.getForm.email.value).then(response => {
      const displayNameControl = this.getForm.displayName;
      if (!response.length) {
        displayNameControl?.setValidators([Validators.required]);
      } else {
        displayNameControl?.setValue(undefined);
        displayNameControl?.clearValidators();
      }
      displayNameControl?.updateValueAndValidity();
      this.statusSignal.set(response.join('|'));
    }).catch(err => console.error('An error happen trying to fetchSignInMethodsForEmail', err));
  }

  private processUser(user: User) {
    const displayName = this.getForm.displayName.value;

    if (displayName) {
      this.firebaseService.updateProfile({ displayName }).catch(console.error);
    }

    if (!user.emailVerified && !this.cookieService.get(VERIFICATION_EMAIL)) {
      this.firebaseService.sendVerificationEmail()
        .then(() => {
          const message = this.translate.instant('AUTH.ACTIVATE_ACCOUNT.MESSAGE');
          this.store.dispatch(signupSuccess({ message }));
          this.cookieService.set(VERIFICATION_EMAIL, 'sent');
        })
        .catch(console.error);
      return;
    }

    this.firebaseService.getIdToken()
      .then(idToken => {
        if (!idToken) {
          return;
        }
        this.store.dispatch(
          login({
            token: idToken,
            queryParams: this.route.snapshot.queryParams,
            theme: this.cookieService.get(THEME),
            code: this.codeSignal(),
          }),
        );
      });
  }
}
