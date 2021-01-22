import { Component, OnInit } from '@angular/core';
import { SocialAuthService, FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { AppState, selectAuthState } from '../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  getState: Observable<any>;

  constructor(private socialService: SocialAuthService, private store: Store<AppState>, private route: ActivatedRoute,
              private snackBar: MatSnackBar, private router: Router) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.subscribe();
  }

  subscribe(): void {
    this.getState.subscribe((state) => {
      if (state.isAuthenticated) {
        this.router.navigate(['main']);
      }
      if (!state.subErrors && (state.errorMessage || state.message)) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
            location.reload(true);
          });
        }

      }
    });
  }

  clean(): void {
    this.store.dispatch(
      new fromActionsLogin.Clean()
    );
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
        new fromActionsLogin.SocialLogin({socialUser, queryParams: this.route.snapshot.queryParams})
      );
    });
  }
}
