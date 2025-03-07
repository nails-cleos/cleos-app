import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { AppState, selectAuthState } from '../store/app.states';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from '@angular/fire/auth';
import { VERIFICATION_EMAIL } from '../util/helper';
import { THEME } from '../util/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';
import { GoogleAuthProvider } from 'firebase/auth';
import { user } from 'rxfire/auth';
import { fetchSignInMethodsForEmail } from '@firebase/auth';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;

  code: string | null = null;
  language: string;
  showForm: boolean;
  status: string;
  tos: string;
  privacyPolicy: string;

  private subscription?: Subscription;
  private getState: Observable<any>;
  private authSubscription?: Subscription;

  get onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password, displayName } = this.loginForm.value;
      if (displayName) {
        createUserWithEmailAndPassword(this.auth, email, password).catch(err => {
          console.error('An error happen trying to createUserWithEmailAndPassword', err)
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
          console.error('An error happen trying to signInWithEmailAndPassword', err)
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

  constructor(@Optional() private auth: Auth, private formBuilder: FormBuilder, private store: Store<AppState>,
              private route: ActivatedRoute, private snackBar: MatSnackBar,
              private cookieService: CookieService, private translate: TranslateService) {
    this.status = 'init';
    this.showForm = false;
    this.getState = this.store.select(selectAuthState);
    this.language = this.translate.currentLang;
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      code: [''],
      displayName: ['']
    });
    this.tos = `${ environment.appServer }/${ this.language }/term-and-conditions`;
    this.privacyPolicy = `${ environment.appServer }/${ this.language }/privacy`;
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
            new fromActionsLogin.Redirect()
          );
        }
      }
      if (!state.subErrors && (state.errorMessage || state.message)) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
          });
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
              new fromActionsLogin.SignUpSuccess({ message })
            );
            this.cookieService.set(VERIFICATION_EMAIL, 'sent');
          }).catch(e => console.error(`Error sending email verification. ${ e }`));
        } else {
          user.getIdToken().then(idToken => {
            const payload = {
              idToken,
              theme: this.cookieService.get(THEME),
              code: localStorage.getItem('CODE'),
              queryParams: this.route.snapshot.queryParams
            };
            localStorage.removeItem('CODE');
            this.store.dispatch(
              new fromActionsLogin.Login(payload)
            );
          });
        }
      }
    });
  }
}
