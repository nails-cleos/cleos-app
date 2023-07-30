import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { AppState, selectAuthState } from '../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { THEME } from '../util/theme';
import { CookieService } from 'ngx-cookie-service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseUISignInFailure } from 'firebaseui-angular';

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

  constructor(private auth: AngularFireAuth, private store: Store<AppState>, private route: ActivatedRoute,
              private snackBar: MatSnackBar, private router: Router, private cookieService: CookieService) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
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

  errorCallback($event: FirebaseUISignInFailure): void {
    console.error('Error in logIn: ', $event);
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
    this.authSubscription = this.auth.authState.subscribe(response => {
      if (response) {
        response.getIdToken().then(idToken => {
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
