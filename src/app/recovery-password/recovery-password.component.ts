import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.scss']
})
export class RecoveryPasswordComponent implements OnInit {

  @ViewChild('passwordComponent') passwordComponent: any;
  showError = false;

  constructor(private store: Store<AppState>, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.clean();
  }

  clean(): void {
    this.store.dispatch(
      new fromActionsLogin.Clean()
    );
  }

  recoveryPassword(): void {
    if (this.passwordComponent.passwordFormControl.invalid
      || this.passwordComponent.passwordConfirmationFormControl.invalid) {
      return;
    }
    const token = this.route.snapshot.queryParamMap.get('token');
    this.store.dispatch(
      new fromActionsLogin.RecoveryPassword({token, password: this.passwordComponent.passwordFormControl.value})
    );
  }

  onStrengthChanged(): void {
    this.showError = true;
    this.passwordComponent.passwordConfirmationFormControl.updateValueAndValidity();
  }
}
