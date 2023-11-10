import { AfterViewInit, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { AppState, selectAuthState } from '../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { Auth, authState, sendEmailVerification } from '@angular/fire/auth';
import { firebase, firebaseui } from 'firebaseui-angular';
import { isIPhone, isMobile, VERIFICATION_EMAIL } from '../util/helper';
import { THEME } from '../util/theme';
import { UntypedFormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, AfterViewInit, OnDestroy {

  code: string | null = null;
  codeForm: UntypedFormControl = new UntypedFormControl();

  private subscription?: Subscription;
  private getState: Observable<any>;
  private authSubscription?: Subscription;
  private ui: firebaseui.auth.AuthUI;

  constructor(@Optional() private auth: Auth, private store: Store<AppState>, private route: ActivatedRoute, private snackBar: MatSnackBar,
              private router: Router, private cookieService: CookieService, private translate: TranslateService) {
    this.getState = this.store.select(selectAuthState);
    this.ui = new firebaseui.auth.AuthUI(this.auth);
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
  }

  ngAfterViewInit(): void {
    if (this.code) {
      this.codeForm.setValue(this.code);
    }
    const queryState = this.route.snapshot.queryParamMap.get('state');
    const signInSuccessUrl = queryState ? `${ location.origin }${ JSON.parse(atob(queryState)).returnUrl }` : location.href;
    const uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: () => true,
        uiShown: () => {
          const loader = document.getElementById('loader');
          if (loader) {
            loader.style.display = 'none';
          }
        }
      },
      signInFlow: isMobile() && !isIPhone() ? 'redirect' : 'popup',
      signInSuccessUrl,
      signInOptions: [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          scopes: [
            'https://www.googleapis.com/auth/admin.directory.user.readonly'
          ]
        },
        {
          requireDisplayName: true,
          provider: firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD
        }
      ],
      credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO
      // Terms of service url.
      // tosUrl: '<your-tos-url>',
      // Privacy policy url.
      // privacyPolicyUrl: '<your-privacy-policy-url>'
    };
    this.ui.start('#firebaseui-auth-container', uiConfig);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.isAuthenticated && !state.redirect) {
        this.store.dispatch(
          new fromActionsLogin.Redirect()
        );
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
    this.codeForm.valueChanges.subscribe(value => {
      if (value) {
        localStorage.setItem('CODE', value);
      }
    });
    this.authSubscription = authState(this.auth).subscribe(response => {
      if (response) {
        if (!response.emailVerified && !this.cookieService.get(VERIFICATION_EMAIL)) {
          sendEmailVerification(response).then(() => {
            const message = this.translate.instant('AUTH.ACTIVATE_ACCOUNT.MESSAGE');
            this.store.dispatch(
              new fromActionsLogin.SignUpSuccess({ message })
            );
            this.cookieService.set(VERIFICATION_EMAIL, 'sent');
          }).catch(e => console.error(`Error sending email verification. ${ e }`));
        } else {
          response.getIdToken().then(idToken => {
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

  private clean(): void {
    this.store.dispatch(
      new fromActionsLogin.Clean()
    );
  }
}
