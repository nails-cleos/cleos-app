import { Component, OnInit } from '@angular/core';
import { SocialAuthService, FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { AppState } from '../store/app.states';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  constructor(private socialService: SocialAuthService, private store: Store<AppState>, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
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
