import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.scss']
})
export class RecoveryPasswordComponent implements OnInit {

  @ViewChild('passwordComponent') passwordComponent: any;
  showError = false;

  constructor(private store: Store<AppState>, private route: ActivatedRoute, private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.clean();
  }

  recoveryPassword(): void {
    if (this.passwordComponent.passwordFormControl.invalid
      || this.passwordComponent.passwordConfirmationFormControl.invalid) {
      return;
    }
    const token = this.route.snapshot.queryParamMap.get('token');
    const lang: string = this.route.snapshot.queryParamMap.get('lang') || navigator.language;
    this.translate.use(lang);
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
}
