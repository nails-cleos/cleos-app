import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../store/app.states';
import * as fromActionsUser from '../store/user.actions';
import { IUser, User } from '../interfaces/user';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  hide = false;
  form!: FormGroup;
  getState: Observable<any>;
  isLoading: boolean | undefined;
  errors: any = [];

  @Output() newItemEvent = new EventEmitter<string>();

  role: FormControl = new FormControl('', [
    Validators.required
  ]);
  username: FormControl = new FormControl('', [
    Validators.required
  ]);
  email: FormControl = new FormControl('', [
    Validators.required, Validators.email
  ]);
  firstName: FormControl = new FormControl('', [
    Validators.required
  ]);
  lastName: FormControl = new FormControl('', [
    Validators.required
  ]);
  password: FormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar, private store: Store<AppState>,
              private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectUserState);
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      role: this.role,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      password: this.password
    });
  }

  clean(): void {
    this.store.dispatch(
      new fromActionsUser.Clean()
    );
  }

  subscribe(): void {
    this.getState.subscribe(state => {
      if (state.selected) {
        this.form.patchValue(state.selected);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
      }
    });
  }

  create(): void {
    const user: IUser = new User();
    user.username = this.username.value;
    user.email = this.email.value;
    user.firstName = this.firstName.value;
    user.lastName = this.lastName.value;
    user.password = this.password.value;

    this.store.dispatch(
      new fromActionsUser.SaveUser({user, role: this.role.value})
    );
  }

}
