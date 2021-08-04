import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState, selectAuthState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../../store/auth.actions';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.scss']
})
export class RecoveryPasswordComponent implements OnInit, OnDestroy {
  @ViewChild('passwordComponent') passwordComponent: any;

  getState: Observable<any>;
  subscription: Subscription | undefined;
  showError = false;
  lang: string;

  constructor(private store: Store<AppState>, private route: ActivatedRoute, private translate: TranslateService,
              private router: Router, private snackBar: MatSnackBar) {
    this.getState = this.store.select(selectAuthState);
    this.lang = this.route.snapshot.queryParamMap.get('lang') || navigator.language;
  }

  ngOnInit(): void {
    this.translate.use(this.lang);
    this.clean();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  recoveryPassword(): void {
    if (this.passwordComponent.passwordFormControl.invalid
      || this.passwordComponent.passwordConfirmationFormControl.invalid) {
      return;
    }
    const token = this.route.snapshot.queryParamMap.get('token');
    this.translate.use(this.lang);
    this.store.dispatch(
      new fromActionsLogin.RecoveryPassword({token, password: this.passwordComponent.passwordFormControl.value})
    );
  }

  onStrengthChanged(): void {
    this.showError = true;
    this.passwordComponent.passwordConfirmationFormControl.updateValueAndValidity();
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsLogin.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.router.navigate(['auth']);
          });
        }
      }
    });
  }
}
