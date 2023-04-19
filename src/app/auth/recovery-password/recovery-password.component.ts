import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState, selectAuthState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../../store/auth.actions';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getLocale } from '../../util/helper';
import { FormBuilder, FormControl, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.scss']
})
export class RecoveryPasswordComponent implements OnInit, OnDestroy {
  passwordFormGroup!: UntypedFormGroup;

  getState: Observable<any>;
  subscription?: Subscription;
  locale: string;

  constructor(private store: Store<AppState>, private route: ActivatedRoute, private translate: TranslateService,
              private router: Router, private snackBar: MatSnackBar, private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectAuthState);
    this.locale = getLocale(this.route.snapshot.queryParamMap.get('locale') || navigator.language).language;
  }

  get recoveryPassword(): void {
    const password = this.passwordFormGroup.get('password')?.value;
    if (this.passwordFormGroup.invalid && password) {
      return;
    }
    const token = this.route.snapshot.queryParamMap.get('token');
    this.translate.use(this.locale);
    return this.store.dispatch(
      new fromActionsLogin.RecoveryPassword({token, password})
    );
  }

  ngOnInit(): void {
    this.translate.use(this.locale);
    this.clean();
    this.subscribe();
    this.passwordFormGroup = this.formBuilder.group({
      password: new FormControl(''),
      confirmPassword: new FormControl('')
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
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
