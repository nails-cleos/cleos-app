import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../store/app.states';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsLogin from '../store/auth.actions';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-activation-code',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss']
})
export class ActivateAccountComponent implements OnInit, OnDestroy {

  getState: Observable<any>;
  subscription: Subscription | undefined;

  constructor(private snackBar: MatSnackBar, private store: Store<AppState>, private route: ActivatedRoute, private router: Router,
              private translate: TranslateService) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
  }

  activate(): void {
    const token: string | null = this.route.snapshot.queryParamMap.get('token');
    const lang: string = this.route.snapshot.queryParamMap.get('lang') || navigator.language;
    this.translate.use(lang);
    this.store.dispatch(
      new fromActionsLogin.ActivateAccount(token)
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });

        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
            this.router.navigate(['auth']);
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
