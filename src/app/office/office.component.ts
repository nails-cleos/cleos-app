import { ChangeDetectionStrategy, Component, computed, effect, inject, input, Signal, signal } from '@angular/core';
import { combineLatestWith } from 'rxjs';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUser } from '../interfaces/user';
import { fieldChange, requireMatch } from '../util/validators';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { createOffice, getOffice, updateOffice } from '../store/actions/office.actions';
import { Role } from '../interfaces/token';
import { map, startWith } from 'rxjs/operators';
import { IOffice, Office } from '../interfaces/office';
import { BackButtonDirective } from '../directives/back-button.directive';
import { OfficeState } from '../store/reducers/office.reducers';
import { getManagersPipe, getSelectedOfficePipe, getSubErrorsPipe } from '../store/selectors/office.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../interfaces/common';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';

type OfficeForm = {
  name: FormControl<string>;
  manager: FormControl<IUser | undefined>;
  subject: FormControl<string | undefined>,
  kvk: FormControl<string | undefined>,
  account: FormControl<string | undefined>,
  btw: FormControl<string | undefined>,
  billingAddress: FormControl<string | undefined>,
  driveFolder: FormControl<string | undefined>,
}

@Component({
  selector: 'app-office',
  templateUrl: './office.component.html',
  styleUrls: ['./office.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatOption, MatIcon, MatButton, ReactiveFormsModule, TranslatePipe,
    MatAutocomplete, MatError, MatAutocompleteTrigger, BackButtonDirective, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeComponent {
  id = input<string>();

  private readonly store: Store<OfficeState> = inject(Store<OfficeState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private selectedOffice$ = this.store.pipe(getSelectedOfficePipe);
  private allManagers$ = this.store.pipe(getManagersPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

  private subErrorsSignal = toSignal(this.subErrors$);

  allManagersSignal = toSignal(this.allManagers$);
  officeSignal = toSignal(this.selectedOffice$);
  isAddModeSignal = computed(() => !this.id());
  errors = signal<Record<string, unknown>>({});

  form: FormGroup<OfficeForm> = this.formBuilder.group<OfficeForm>({
    name: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    manager: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    subject: this.formBuilder.control(undefined),
    kvk: this.formBuilder.control(undefined),
    account: this.formBuilder.control(undefined),
    btw: this.formBuilder.control(undefined),
    billingAddress: this.formBuilder.control(undefined),
    driveFolder: this.formBuilder.control(undefined),
  });

  filteredManagerSignal: Signal<IUser[] | undefined> = toSignal(
    this.getForm.manager.valueChanges.pipe(
      startWith(undefined),
      map((value?: IUser | string) => !value || typeof value === 'string' ? value : value.displayName),
      combineLatestWith(this.allManagers$),
      map(([name, managers]) => {
        if (!managers) {
          return [];
        }

        return name ? this.filter(name, managers) : managers.slice();
      })),
  );

  private readonly language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const selected = this.officeSignal();
      if (selected?.id) {
        this.form.patchValue(selected);
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof OfficeForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      const id = this.id();
      if (id) {
        this.store.dispatch(getOffice({ id }));
      }
    });
  }

  get getForm(): OfficeForm {
    return this.form.controls;
  }

  get managerName(): string | undefined {
    const office = this.officeSignal();
    return office?.manager.displayName;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const officeSignal = this.officeSignal();
    const office: IOffice = new Office();
    office.name = fieldChange(this.getForm.name, officeSignal?.name);
    office.subject = fieldChange(this.getForm.subject, officeSignal?.subject);
    office.kvk = fieldChange(this.getForm.kvk, officeSignal?.kvk);
    office.account = fieldChange(this.getForm.account, officeSignal?.account);
    office.btw = fieldChange(this.getForm.btw, officeSignal?.btw);
    office.billingAddress = fieldChange(this.getForm.billingAddress, officeSignal?.billingAddress);
    office.driveFolder = fieldChange(this.getForm.driveFolder, officeSignal?.driveFolder);

    const id = this.id();
    if (!id) {
      office.managerId = this.getForm.manager.value?.id;
      this.store.dispatch(createOffice({ office }));
    } else {
      this.store.dispatch(updateOffice({ id, office }));
    }
    return;
  }

  addManager() {
    this.router.navigate([this.language, 'users', 'add'], { state: { role: Role.manager } });
  }

  displayFn = (user: IUser): string => user?.displayName ? user.displayName : '';

  private filter = (name: string, managers: IUser[]): IUser[] | undefined => managers?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
