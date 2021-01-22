import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { IUser, User } from '../../interfaces/user';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import * as fromActionsUser from '../../store/user.actions';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FieldChange } from '../../util/validators';

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
              private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectUserState);
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
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

  clean(): void {
    this.store.dispatch(
      new fromActionsUser.Clean()
    );
  }

  subscribe(): void {
    this.getState.subscribe(state => {
      if (state.selected) {
        this.user = state.selected;
        this.form.patchValue(state.selected);
      }
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
        new fromActionsUser.FindUser(id)
      );
    }
  }

  update(): void {
    const user: IUser = new User();
    user.id = this.user?.id;
    user.username = FieldChange(this.username, this.user?.username);
    user.email = FieldChange(this.email, this.user?.email);
    user.firstName = FieldChange(this.firstName, this.user?.firstName);
    user.lastName = FieldChange(this.lastName, this.user?.lastName);

    this.store.dispatch(new fromActionsUser.SaveUser({user}));
  }
}
