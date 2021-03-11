import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../store/app.states';
import { IUser, User } from '../interfaces/user';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as fromActionsUser from '../store/user.actions';
import { FieldChange, ValueChange } from '../util/validators';
import { Location } from '@angular/common';
import { Maps, IFlag } from '../util/maps';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  getState: Observable<any>;
  subscription: Subscription | undefined;
  form!: FormGroup;
  errors: any = [];
  user: IUser | undefined;
  canChange = false;
  showInitials = false;
  initials: string | undefined;
  isLoading = false;

  username: FormControl = new FormControl('', [
    Validators.required
  ]);
  firstName: FormControl = new FormControl('', [
    Validators.required
  ]);
  lastName: FormControl = new FormControl('', [
    Validators.required
  ]);
  langValue: FormControl = new FormControl('', [
    Validators.required
  ]);

  flags: IFlag[] = Maps();

  constructor(private snackBar: MatSnackBar, private store: Store<AppState>, private formBuilder: FormBuilder, private location: Location,
              private cdRef: ChangeDetectorRef, private router: Router) {
    this.getState = this.store.select(selectUserState);
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.findMe();
    this.subscribe();
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  update(): void {
    if (this.form.invalid) {
      return;
    }
    const user: IUser = new User();
    user.lang = ValueChange(this.langValue.value.value, this.user?.lang);
    user.username = FieldChange(this.username, this.user?.username);
    user.firstName = FieldChange(this.firstName, this.user?.firstName);
    user.lastName = FieldChange(this.lastName, this.user?.lastName);

    this.store.dispatch(
      new fromActionsUser.UpdateUser(user)
    );
  }

  back(): void {
    this.location.back();
  }

  private findMe(): void {
    this.store.dispatch(
      new fromActionsUser.FindMe()
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      langValue: this.langValue
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsUser.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      this.isLoading = state.isLoading;
      if (state.selected) {
        const user = state.selected;
        this.user = user;
        this.canChange = user?.provider === 'LOCAL';
        if (user.firstName) {
          this.initials = `${user.firstName.charAt(0)} ${user?.lastName?.charAt(0)}`;
        } else {
          this.initials = user?.username?.charAt(0);
        }
        if (!user.imageUrl) {
          this.showInitials = true;
        }
        this.form.patchValue(state.selected);
        const langValue = this.flags.filter((lang: any) => lang.value === state.selected.lang)[0];
        this.langValue.setValue(langValue);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
            this.router.navigate(['main']);
          });
        }
      }
    });
  }
}
