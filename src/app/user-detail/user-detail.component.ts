import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { IUser, User } from '../interfaces/user';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../store/app.states';
import { FindUser, SaveUser } from '../store/user.actions';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, AfterViewInit {

  @Input() user: IUser | undefined;
  form!: FormGroup;
  getState: Observable<any>;
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

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar, private store: Store<AppState>,
              private formBuilder: FormBuilder, private router: Router) {
    this.getState = this.store.select(selectUserState);
  }

  private static getValue(formControl: FormControl, value: string | undefined): string | undefined {
    return formControl.dirty && value !== formControl.value ? formControl.value : null;
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
  }

  ngAfterViewInit(): void {
    this.getUser();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    });
  }

  subscribe(): void {
    this.getState.subscribe(state => {
      if (state.selected) {
        this.form.patchValue(state.selected);
      }
      this.user = state.selected;
      console.log(state)
      if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
      }
    });
  }

  getUser(): void {
    if (!this.user) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new FindUser(id)
      );
    }
  }

  update(): void {
    const user: IUser = new User();
    user.id = this.user?.id;
    user.username = UserDetailComponent.getValue(this.username, this.user?.username);
    user.email = UserDetailComponent.getValue(this.email, this.user?.email);
    user.firstName = UserDetailComponent.getValue(this.firstName, this.user?.firstName);
    user.lastName = UserDetailComponent.getValue(this.lastName, this.user?.lastName);

    this.store.dispatch(new SaveUser(user));
  }
}
