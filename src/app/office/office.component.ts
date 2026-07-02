import { ChangeDetectionStrategy, Component, effect, inject, input, output, Signal, signal } from '@angular/core';
import { combineLatestWith } from 'rxjs';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUser } from '../user/user';
import { requireMatch } from '../util/validators';
import { TranslatePipe } from '@ngx-translate/core';
import { Role } from '../interfaces/token';
import { map, startWith } from 'rxjs/operators';
import { IOffice, IOfficeAll, Office, OfficeForm } from './office';
import { BackButtonDirective } from '../directives/back-button.directive';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ICommon, IError } from '../interfaces/common';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { OfficeStore } from '../store/office.store';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-office',
  templateUrl: './office.component.html',
  styleUrls: ['./office.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatOption, MatIcon, MatButton, ReactiveFormsModule, TranslatePipe,
    MatAutocomplete, MatError, MatAutocompleteTrigger, BackButtonDirective, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeComponent {
  config = input.required<ICommon>();
  office = input<IOfficeAll | undefined>();
  managers = input<IUser[] | undefined>();

  submitData = output<IOffice>();

  private readonly officeStore = inject(OfficeStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly navigationService: NavigationService = inject(NavigationService);

  private subErrorsSignal = this.officeStore.subErrors;

  isLoading = this.officeStore.isLoading;
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
      combineLatestWith(toObservable(this.managers)),
      map(([name, managers]) => {
        if (!managers) {
          return [];
        }

        return name ? this.filter(name, managers) : managers.slice();
      })),
  );

  constructor() {
    effect(() => {
      const selected = this.office();
      if (selected) {
        this.form.patchValue(selected);
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as string | undefined;

          if (field && field in this.form.controls) {
            const officeField = field as keyof OfficeForm;
            errorMap[field] = error.message;
            this.form.controls[officeField].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });
  }

  get getConfig(): ICommon {
    return this.config();
  }

  get getForm(): OfficeForm {
    return this.form.controls;
  }

  get managerName(): string | undefined {
    const office = this.office();
    return office?.manager?.displayName;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitData.emit(Office.fromForm(this.getForm, this.office()));
  }

  addManager() {
    this.navigationService.navigate(['users', 'add'], { state: { role: Role.manager } });
  }

  displayFn = (user: IUser): string => user?.displayName ? user.displayName : '';

  private filter = (name: string, managers: IUser[]): IUser[] | undefined => managers?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
