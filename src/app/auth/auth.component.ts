import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { AppState, selectAuthState } from '../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('authGroup') authGroup: any;

  getState: Observable<any>;
  subscription: Subscription | undefined;
  code: string | undefined | null;
  extras: any;

  constructor(private socialService: SocialAuthService, private store: Store<AppState>, private route: ActivatedRoute,
              private snackBar: MatSnackBar, private router: Router) {
    this.getState = this.store.select(selectAuthState);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
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

  socialSignIn(provider: string): void {
    let id = '';
    if (provider === 'google') {
      id = GoogleLoginProvider.PROVIDER_ID;
    } else if (provider === 'facebook') {
      id = FacebookLoginProvider.PROVIDER_ID;
    }

    this.socialService.signIn(id).then(socialUser => {
      this.store.dispatch(
        new fromActionsLogin.SocialLogin({
          socialUser,
          code: this.code,
          queryParams: this.route.snapshot.queryParams,
          extras: this.extras
        })
      );
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.isAuthenticated) {
        this.router.navigate(['auth', 'redirect']);
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
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsLogin.Clean()
    );
  }
}
