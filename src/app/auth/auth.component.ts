import { AfterViewInit, Component, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { AppState, selectAuthState } from '../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { THEME } from '../util/theme';
import { CookieService } from 'ngx-cookie-service';
import { Auth, authState } from '@angular/fire/auth';
import { firebase, firebaseui } from 'firebaseui-angular';
import { isIPhone, isMobile } from '../util/helper';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('authGroup') authGroup: any;

  code?: string | null;

  private subscription?: Subscription;
  private getState: Observable<any>;
  private authSubscription?: Subscription;
  private ui: firebaseui.auth.AuthUI;

  constructor(@Optional() private auth: Auth, private store: Store<AppState>, private route: ActivatedRoute,
              private snackBar: MatSnackBar, private router: Router, private cookieService: CookieService) {
    this.getState = this.store.select(selectAuthState);
    this.ui = new firebaseui.auth.AuthUI(this.auth);
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    console.log(isMobile() && !isIPhone() ? 'redirect' : 'popup')
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
      signInSuccessUrl: location.href,
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        // firebase.auth.EmailAuthProvider.PROVIDER_ID
      ]
      // Terms of service url.
      // tosUrl: '<your-tos-url>',
      // Privacy policy url.
      // privacyPolicyUrl: '<your-privacy-policy-url>'
    };
    this.ui.start('#firebaseui-auth-container', uiConfig);
  }

  ngAfterViewInit(): void {
    if (this.code) {
      this.authGroup.selectedIndex = 1;
    }
  }

  getCode($event: string): void {
    this.code = $event;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      const queryState = this.route.snapshot.queryParamMap.get('state');
      const returnUrl = queryState ? JSON.parse(atob(queryState)).returnUrl : null;
      if (state.isAuthenticated && !state.redirect && !returnUrl) {
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
    this.authSubscription = authState(this.auth).subscribe(response => {
      if (response && response.providerData[0].providerId === 'google.com') {
        this.auth.currentUser?.getIdToken().then(idToken => {
          this.store.dispatch(
            new fromActionsLogin.SocialLogin({
              socialUser: {
                idToken,
                provider: response.providerId.toUpperCase()
              },
              theme: this.cookieService.get(THEME),
              code: this.code,
              queryParams: this.route.snapshot.queryParams
            })
          );
        });
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsLogin.Clean()
    );
  }
}
