import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Expense, ExpenseForm, IExpense, IExpenseAll, ISupplyStore, ITotalExpense } from './expense';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { combineLatestWith } from 'rxjs';
import { createNewDateZonedTime, getNowTimeZone } from '../../../util/dates';
import { noDuplicateDatesValidator } from '../../../util/validators';
import { map, startWith } from 'rxjs/operators';
import { TwoDigitsDirective } from '../../../directives/two-digits.directive';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ICommon, IError } from '../../../interfaces/common';
import { FileDropComponent, UploadFile } from '../../../shared/file-drop/file-drop.component';
import { awsExtractToNumberFormat } from '../../../interfaces/aws';
import { calculateBTW, calculateNet } from '../../../util/numbers';
import { AuthUserService } from '../../../services/auth-user.service';
import { DriveAccessService } from '../../../services/drive-access.service';
import { EnvService } from '../../../services/env.service';
import { TokenService } from '../../../services/token.service';
import { MatError, MatFormField, MatHint, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatOptgroup, MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatCheckbox } from '@angular/material/checkbox';
import { AwsStore } from '../../../store/aws.store';
import { ExpenseStore } from '../../../store/expense.store';
import { NavigationService } from '../../../services/navigation.service';

type TotalsForm = {
  type: FormControl<string>;
  gross: FormControl<string>;
  btw: FormControl<string>;
  description: FormControl<string>;
}

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss'],
  imports: [TwoDigitsDirective, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle,
    MatDatepicker, MatSelect, MatOption, MatIcon, MatIconButton, MatButton, ReactiveFormsModule, TranslatePipe,
    KeyValuePipe, DecimalPipe, MatAutocomplete, MatError, MatAutocompleteTrigger, MatPrefix, MatSuffix,
    BackButtonDirective, TwoDigitsDirective, BackButtonDirective, FileDropComponent, MatOptgroup, MatHint,
    MatCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseComponent {
  roomId = input.required<string>();
  config = input.required<ICommon>();
  expense = input<IExpenseAll | undefined>();
  submitData = output<{ expense: IExpense, file?: File }>();

  private readonly env: EnvService = inject(EnvService);
  private readonly expenseStore = inject(ExpenseStore);
  private readonly awsStore = inject(AwsStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly driveAccessService: DriveAccessService = inject(DriveAccessService);
  private readonly tokenService: TokenService = inject(TokenService);
  private readonly formDirective = viewChild(FormGroupDirective);

  private awsSignal = this.awsStore.data;
  private userId = computed(() => this.authUserService.authUser().userId);

  private infoSignal = this.expenseStore.info;
  private subErrorsSignal = this.expenseStore.subErrors;
  private responseSignal = this.expenseStore.response;
  private errorSignal = this.expenseStore.error;
  private isLoadingSignal = this.expenseStore.isLoading;

  errors = signal<Record<string, unknown>>({});
  private readonly createAnotherState = signal(false);
  private readonly pendingCreateAnotherReset = signal(false);
  private readonly createAnotherRequestStarted = signal(false);

  form: FormGroup<ExpenseForm> = this.formBuilder.group<ExpenseForm>({
    invoice: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    supplyStore: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    date: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
    totals: this.formBuilder.array<FormGroup<TotalsForm>>([], { validators: [noDuplicateDatesValidator('btw')] }),
  });

  types = computed(() => this.infoSignal()?.types || []);
  currencyIcon = computed(() => this.infoSignal()?.currency?.icon || '');
  roomName = computed(() => this.infoSignal()?.roomName || '');
  supplyStores = computed(() => this.infoSignal()?.supplyStores || []);
  today = computed(() => getNowTimeZone(this.timeZone()));
  readonly fileName = computed(() => this.expense()?.document?.name);

  filteredSupplyStore = toSignal(
    this.getForm.supplyStore.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      combineLatestWith(toObservable(this.supplyStores)),
      map(([name, supplyStores]) => {
        if (name) {
          return this.filterSupplyStore(name, supplyStores);
        } else {
          return supplyStores ? supplyStores.slice() : supplyStores;
        }
      }),
    ),
  );

  totalMap: Map<number, { btwValue: string, net: string }> = new Map();

  file = signal<UploadFile | undefined>(undefined);
  private timeZone = computed(() => this.infoSignal()?.timeZone || '');
  private selectedSupplyStore = toSignal(this.getForm.supplyStore.valueChanges);

  private readonly language: string = this.navigationService.language;

  constructor() {
    effect(() => {
      const selected = this.expense();
      if (selected?.document) {
        this.file.set({ name: selected.document.name, progress: 100, size: 0 });
      }
      if (selected) {
        queueMicrotask(() => {
          this.form.patchValue(selected);
          this.getForm.date.setValue(createNewDateZonedTime(selected.timestamp, selected.room?.timeZone));
          this.removeExpense(0);
          selected.expenseTotals.forEach(
            (it, index) => this.addTotal(true, index, it.gross, it.btw, it.description, it.type),
          );
        });
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof ExpenseForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      if (this.responseSignal()) {
        if (!this.expense() && this.createAnother) {
          return;
        }

        this.navigationService.navigate(['rooms', this.roomId(), 'expenses']);
      }
    });

    effect(() => {
      if (!this.pendingCreateAnotherReset()) {
        return;
      }

      if (this.isLoadingSignal()) {
        this.createAnotherRequestStarted.set(true);
        return;
      }

      if (!this.createAnotherRequestStarted()) {
        return;
      }

      this.pendingCreateAnotherReset.set(false);
      this.createAnotherRequestStarted.set(false);

      if (this.errorSignal() || this.subErrorsSignal()) {
        return;
      }

      this.awsStore.clean?.();
      this.file.set(undefined);
      this.resetCreateAnotherForm();
    });

    effect(() => {
      this.expenseStore.loadInfo(this.roomId());
    });

    effect(() => {
      const file = this.file()?.raw;
      if (!file) {
        if (this.expense()) {
          return;
        }
        this.resetCreateAnotherForm();
        return;
      }
      const token = this.tokenService.token();
      if (token && this.env.awsExtractEnable) {
        this.awsStore.processPdf(token, file, this.userId());
      }
    });

    effect(() => {
      const aws = this.awsSignal();
      const file = this.file()?.raw;
      if (!aws || !file) {
        return;
      }

      this.setSupplierOrName(aws.VENDOR_NAME);
      if (aws.INVOICE_RECEIPT_DATE) {
        const date = new Date(aws.INVOICE_RECEIPT_DATE);
        if (!isNaN(date.getTime())) {
          this.getForm.date.setValue(date);
        }
      }
      if (aws.INVOICE_RECEIPT_ID) {
        this.getForm.invoice.setValue(aws.INVOICE_RECEIPT_ID);
      }
      let total = awsExtractToNumberFormat(aws.TOTAL);
      const btwValue = awsExtractToNumberFormat(aws.TAX);
      const subtotal = awsExtractToNumberFormat(aws.SUBTOTAL);

      let btwPercentage = 0;
      if (!total && subtotal && btwValue) {
        total = subtotal + btwValue;
      }
      if (total) {
        btwPercentage = subtotal ? calculateBTW(total, subtotal) : 0;
        this.addTotal(true, 0, total, btwPercentage);
      }
    });

    effect(() => {
      const supplyStore = this.selectedSupplyStore();
      if (supplyStore && typeof supplyStore === 'string' && this.getForm.supplyStore.value === supplyStore) {
        this.getForm.supplyStore.setValue({ id: '', name: supplyStore });
      }
    });

    effect(() => {
      this.driveAccessService.requestAccessIfNeeded(this.env.googleDriveUploadFile);
    });
  }

  get getConfig(): ICommon {
    return this.config();
  }

  get getForm(): ExpenseForm {
    return this.form.controls;
  }

  get totals(): FormArray<FormGroup<TotalsForm>> {
    return this.getForm.totals;
  }

  get isAddButtonDisabled(): boolean {
    if (this.totals.invalid) {
      return true;
    }

    return this.totals.controls.some(control => {
      return control.invalid;
    });
  }

  private resetCreateAnotherForm(): void {
    const formDirective = this.formDirective();
    this.totals.clear();
    this.totalMap = new Map();
    if (formDirective?.form) {
      formDirective.resetForm();
      (formDirective as FormGroupDirective & { submitted: boolean }).submitted = false;
    }

    this.getForm.invoice.reset('', { emitEvent: false });
    this.getForm.supplyStore.reset('', { emitEvent: false });
    this.getForm.date.reset(undefined, { emitEvent: false });
    this.errors.set({});
    this.form.markAsPristine({ emitEvent: false });
    this.form.markAsUntouched({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  submit() {
    const date = this.getForm.date.value;
    const uploadFile = this.file();
    if (this.form.invalid || !date || !uploadFile) {
      return;
    }

    const expense: IExpense = Expense.fromForm(this.getForm, date, this.expense(),
      this.totals.getRawValue() as unknown as ITotalExpense[]);
    const file = uploadFile.raw;
    if (!this.expense() && this.createAnother) {
      this.pendingCreateAnotherReset.set(true);
      this.createAnotherRequestStarted.set(false);
    }
    this.submitData.emit({ expense, file });
  }

  removeSupplyStore() {
    this.getForm.supplyStore.setValue('');
  }

  get totalGross(): number {
    return this.totals.controls
      .map(expense => expense.value.gross || '0')
      .reduce((acc, grossValue) => acc + parseFloat(grossValue), 0);
  }

  get totalBTW(): number {
    return Array.from(this.totalMap.values())
      .map(total => parseFloat(total.btwValue) || 0)
      .reduce((acc, btw) => acc + btw, 0);
  }

  get totalNet(): number {
    return Array.from(this.totalMap.values())
      .map(total => parseFloat(total.net) || 0)
      .reduce((acc, btw) => acc + btw, 0);
  }

  displayFnSupplyStore = (supplyStore: ISupplyStore): string => supplyStore ? `${ supplyStore.name }` : '';

  validateInputValue = (input: HTMLInputElement, index: number, min?: number, max?: number): void => {
    const id = input.id.replace(`${ index }`, '');
    const expense = this.totals.at(index)?.get(id);
    if (input.value) {
      this.errors.update(prev => {
        prev[input.id] = null;
        return prev;
      });
      const value = parseFloat(input.value);
      if (isNaN(value)) {
        expense?.setValue(null);
        return;
      }
      const EXPENSE = this.translateService.instant('EXPENSE');
      if (min !== undefined && value < min) {
        this.errors.update(prev => {
          prev[input.id] = EXPENSE[id.toUpperCase()].MIN;
          return prev;
        });
      } else if (max && value > max) {
        this.errors.update(prev => {
          prev[input.id] = EXPENSE[id.toUpperCase()].MAX;
          return prev;
        });
      }

      if (this.errors()[input.id]) {
        expense?.setValue('');
        expense?.setErrors({ incorrect: true });
      } else {
        expense?.setValue(value.toFixed(2));
        const grossValue = this.totals.at(index)?.get('gross')?.value;
        if (grossValue) {
          const btwValue = this.totals.at(index)?.get('btw')?.value;
          const gross = parseFloat(grossValue);
          let btw = 0;
          if (btwValue) {
            btw = parseFloat(btwValue);
          }
          this.addTotal(false, index, gross, btw);
        }
      }
    } else {
      expense?.setValue(undefined);
    }
  };

  addDate = (): void => this.totals.push(this.createTotals());

  removeExpense = (index: number): void => this.totals.removeAt(index);

  private createTotals = (
    type: string = '',
    gross: string = '',
    btw: string = '',
    description: string = '',
  ): FormGroup => this.formBuilder.group({
    type: [type, [Validators.required]],
    gross: [gross, [Validators.required]],
    btw: [btw, [Validators.required]],
    description: [description],
  });

  private filterSupplyStore = (
    name: string,
    supplyStores: ISupplyStore[],
  ): ISupplyStore[] | undefined => supplyStores?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  onSelectedFile(currentFile?: UploadFile) {
    this.file.set(currentFile);
  }

  get createAnother(): boolean {
    return this.createAnotherState();
  }

  set createAnother(value: boolean) {
    this.createAnotherState.set(value);
  }

  private setSupplierOrName(supplyStore: string = '') {
    const supplier = this.supplyStores().find(it => it.name.toLowerCase() === supplyStore?.toLowerCase());
    if (supplier) {
      this.getForm.supplyStore.setValue(supplier);
    } else {
      this.getForm.supplyStore.setValue(supplyStore);
    }
  }

  private addTotal(add: boolean, index: number, gross: number, btw?: number, description?: string, type?: string) {
    const total = this.totalMap.get(index) ?? { net: '', btwValue: '' };
    const grossValue = gross.toFixed(2);
    if (btw) {
      total.net = calculateNet(gross, btw).toFixed(2);
    } else {
      total.net = grossValue;
    }
    if (add) {
      this.totals.push(this.createTotals(type, grossValue, (btw ?? 0).toFixed(2), description));
    }
    total.btwValue = (gross - parseFloat(total.net)).toFixed(2);
    this.totalMap.set(index, total);
  }
}
