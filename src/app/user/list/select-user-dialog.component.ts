import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IUser, IUserAll } from '../user';
import { combineLatestWith } from 'rxjs';
import { requireMatch } from '@app/util/validators';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { map, startWith } from 'rxjs/operators';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem } from '@angular/material/list';
import { MatButton } from '@angular/material/button';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { UserStore } from '@app/store/user.store';

type SelectUserForm = {
  user: FormControl<IUserAll | undefined>;
};

export type SelectUserDialogData = {
  newUser: IUserAll;
  small: boolean;
};

@Component({
  selector: 'app-select-user-dialog-component',
  templateUrl: './select-user-dialog.component.html',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatOption,
    MatIcon,
    MatList,
    MatListItem,
    MatButton,
    TranslatePipe,
    MatAutocomplete,
    MatError,
    MatAutocompleteTrigger,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectUserDialogComponent {
  private readonly userStore = inject(UserStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );
  private readonly dialogRef = inject(MatDialogRef<SelectUserDialogComponent>);
  readonly data = inject<SelectUserDialogData>(MAT_DIALOG_DATA);

  users = computed(() =>
    this.userStore.users()?.filter((it: IUser) => it.id !== this.newUser.id),
  );

  form: FormGroup<SelectUserForm> = this.formBuilder.group<SelectUserForm>({
    user: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
  });

  newUser: IUserAll = this.data.newUser;

  filteredUserSignal: Signal<IUserAll[] | undefined> = toSignal(
    this.getForm.user.valueChanges.pipe(
      startWith('' as string),
      map((value: any) =>
        !value || typeof value === 'string' ? value : value.name,
      ),
      combineLatestWith(toObservable(this.users)),
      map(([name, users]) => {
        if (!users) {
          return [];
        }

        return name ? this.filterUser(name, users) : users.slice();
      }),
    ),
  );

  constructor() {
    this.userStore.clean();
    this.userStore.loadDisabledUsers();
  }

  get getForm(): SelectUserForm {
    return this.form.controls;
  }

  get getUser(): IUserAll | undefined {
    return this.getForm.user.value;
  }

  onNoClick(): void {
    return this.dialogRef.close();
  }

  doAction(): void {
    return this.dialogRef.close(this.getUser);
  }

  displayFnUser = (user: IUser): string =>
    user?.displayName ? user.displayName : '';

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.user.setValue(undefined);
    }
  };

  private filterUser = (
    name: string,
    users?: IUserAll[],
  ): IUserAll[] | undefined =>
    users?.filter(
      (option) =>
        option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0,
    );
}
