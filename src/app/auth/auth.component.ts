import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { VERIFICATION_EMAIL } from '../util/helper';
import { THEME } from '../util/theme';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastService } from '../services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { EnvService } from '../services/env.service';
import { FirebaseService } from '../services/firebase.service';
import { User } from 'firebase/auth';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { NgTemplateOutlet } from '@angular/common';
import { AuthStore } from '../store/auth.store';
import { NavigationService } from '../services/navigation.service';

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
  imports: [MatFormField, MatLabel, MatInput, MatIcon, MatButton, ReactiveFormsModule, TranslatePipe, RouterLink,
    NgTemplateOutlet, MatError],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  private readonly env: EnvService = inject(EnvService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly cookieService: CookieService = inject(CookieService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly firebaseService = inject(FirebaseService);
  private readonly navigationService: NavigationService = inject(NavigationService);

  queryParams = toSignal(this.route.queryParamMap);

  private isAuthenticatedSignal = this.authStore.isAuthenticated;
  private redirectSignal = this.authStore.redirect;
  private queryParamsSignal = this.authStore.queryParams;
  private errorSignal = this.authStore.error;
  private responseSignal = this.authStore.response;
  private codeSignal = computed(() => this.queryParams()?.get('code') ?? undefined);

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

  readonly language: string = this.navigationService.language;
  showForm: boolean = false;
  tos: string = `${ this.env.appServer }/${ this.language }/term-and-conditions`;
  privacyPolicy: string = `${ this.env.appServer }/${ this.language }/privacy`;

  constructor() {
    this.authStore.clean();
    effect(() => {
      if (this.isAuthenticatedSignal()) {
        const queryParams = this.queryParamsSignal();
        let returnUrl;
        if (queryParams?.state) {
          returnUrl = JSON.parse(atob(queryParams.state))?.returnUrl;
        }
        if (!this.redirectSignal() && !returnUrl) {
          this.authStore.authRedirect();
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
        toastRef.onAction().subscribe(() => this.authStore.clearResponse());
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
        this.authStore.setCurrentCode(code);
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
          const message = this.translateService.instant('AUTH.ACTIVATE_ACCOUNT.MESSAGE');
          this.authStore.signupSuccess({ message });
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
        this.authStore.login(idToken, this.codeSignal(), this.cookieService.get(THEME),
          this.route.snapshot.queryParams);
      });
  }
}
