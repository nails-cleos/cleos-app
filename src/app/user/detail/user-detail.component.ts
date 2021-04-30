import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IUser, User } from '../../interfaces/user';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import * as fromActionsUser from '../../store/user.actions';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { fieldChange, valueChange } from '../../util/validators';
import { findFlag, flags, IFlag } from '../../util/flags';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() user: IUser | undefined;
  form!: FormGroup;
  getState: Observable<any>;
  subscription: Subscription | undefined;
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
  langValue: FormControl = new FormControl('', [
    Validators.required
  ]);

  flagList: IFlag[] = flags();
  error: any;

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar, private store: Store<AppState>,
              private formBuilder: FormBuilder, private cdRef: ChangeDetectorRef) {
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

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  update(): void {
    if (this.form.invalid) {
      return;
    }

    const user: IUser = new User();
    user.id = this.user?.id;
    user.username = fieldChange(this.username, this.user?.username);
    user.email = fieldChange(this.email, this.user?.email);
    user.firstName = fieldChange(this.firstName, this.user?.firstName);
    user.lastName = fieldChange(this.lastName, this.user?.lastName);
    user.lang = valueChange(this.langValue.value.value, this.user?.lang);

    this.store.dispatch(new fromActionsUser.SaveUser({user}));
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      username: this.username,
      email: this.email,
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
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.user = state.selected;
        this.form.patchValue(state.selected);
        this.langValue.setValue(findFlag(this.flagList, state.selected.lang));
        this.cdRef.detectChanges();
      }
      if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
        this.error = state.error;
      }
    });
  }

  private getUser(): void {
    if (!this.user) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsUser.FindUser(id)
      );
    }
  }
}
