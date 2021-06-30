import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../store/app.states';
import * as fromActionsUser from '../store/user.actions';
import { IUser, User } from '../interfaces/user';
import { flags, IFlag } from '../util/flags';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {

  hide = false;
  form!: FormGroup;
  subscription: Subscription | undefined;
  getState: Observable<any>;
  errors: any = [];

  role: FormControl = new FormControl('', [
    Validators.required
  ]);
  username: FormControl = new FormControl('', [
    Validators.required
  ]);
  email: FormControl = new FormControl('', [
    Validators.required, Validators.email
  ]);
  lang: FormControl = new FormControl('', [
    Validators.required
  ]);

  firstName: FormControl = new FormControl();
  lastName: FormControl = new FormControl();
  phone: FormControl = new FormControl();

  flagList: IFlag[] = flags();

  extras: any;

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar, private store: Store<AppState>,
              private formBuilder: FormBuilder, private router: Router, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectUserState);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    if (this.extras) {
      this.role.setValue(this.extras.role);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.cdRef.detectChanges();
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }
    const user: IUser = new User();
    user.username = this.username.value;
    user.email = this.email.value;
    user.firstName = this.firstName.value;
    user.lang = this.lang.value.value;
    user.lastName = this.lastName.value;
    user.phone = this.phone.value;
    user.password = 'Ch4ng#';

    this.store.dispatch(
      new fromActionsUser.SaveUser({user, role: this.role.value})
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      role: this.role,
      username: this.username,
      email: this.email,
      lang: this.lang,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsUser.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.errorMessage || state.message) {
        this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        if (state.message) {
          this.router.navigate(['users']);
        }
      }
    });
  }
}
