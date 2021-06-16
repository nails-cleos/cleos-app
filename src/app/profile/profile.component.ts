import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../store/app.states';
import { IUser, User } from '../interfaces/user';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as fromActionsUser from '../store/user.actions';
import { fieldChange, valueChange } from '../util/validators';
import { Location } from '@angular/common';
import { findFlag, flags, IFlag } from '../util/flags';
import { getUserImage, getUserNameInitials } from '../util/helper';

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
  error: any;
  user: IUser | undefined;
  canChange = false;
  image: string | undefined;
  initials: string | undefined;
  isLoading = false;
  prevImg: string | undefined;

  username: FormControl = new FormControl('', [
    Validators.required
  ]);
  langValue: FormControl = new FormControl('', [
    Validators.required
  ]);

  firstName: FormControl = new FormControl();
  lastName: FormControl = new FormControl();
  phone: FormControl = new FormControl();

  flagList: IFlag[] = flags();

  constructor(private snackBar: MatSnackBar, private store: Store<AppState>, private formBuilder: FormBuilder, private location: Location,
              private cdRef: ChangeDetectorRef) {
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
    user.lang = valueChange(this.langValue.value.value, this.user?.lang);
    user.username = fieldChange(this.username, this.user?.username);
    user.firstName = fieldChange(this.firstName, this.user?.firstName);
    user.lastName = fieldChange(this.lastName, this.user?.lastName);
    user.phone = fieldChange(this.phone, this.user?.phone);

    this.user = undefined;
    this.store.dispatch(
      new fromActionsUser.UpdateUser(user)
    );
  }

  onSelectFile(target: any): void {
    if (target.files && target.files[0]) {
      const file = target.files[0];
      this.prevImg = this.user?.image;
      this.user = undefined;
      this.store.dispatch(
        new fromActionsUser.UpdatePhoto(file)
      );
    }
  }

  private findMe(): void {
    this.store.dispatch(
      new fromActionsUser.FindMe()
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      username: this.username,
      langValue: this.langValue,
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
      this.isLoading = state.isLoading;
      if (state.selected && !this.isLoading) {
        const user = state.selected;
        this.user = user;
        this.canChange = user?.provider === 'LOCAL';
        this.initials = getUserNameInitials(user);
        this.image = getUserImage(user);
        this.form.patchValue(state.selected);
        const langValue = findFlag(this.flagList, state.selected.lang);
        this.langValue.setValue(langValue);
        this.cdRef.detectChanges();
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.errorMessage || state.message) {
        if (state.message) {
          this.findMe();
        } else {
          this.error = state.error;
        }
        const snackbarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        if (state.message) {
          const userStore: any = JSON.parse(localStorage.getItem('auth') as string);
          if (userStore && this.user) {
            if (userStore.user.image !== this.prevImg) {
              userStore.user.image = this.user.image;
              localStorage.setItem('auth', JSON.stringify(userStore));
              snackbarRef.afterDismissed().subscribe(() => window.location.reload());
            }
          }
        }
      }
    });
  }
}
