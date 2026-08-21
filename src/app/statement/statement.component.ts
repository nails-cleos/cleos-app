import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { combineLatestWith } from 'rxjs';
import { getNowTimeZone, invoiceFormat, newDate } from '../util/dates';
import { map, startWith } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { IOfficeAll } from '../office/office';
import { requireMatch } from '../util/validators';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DriveAccessService } from '../services/drive-access.service';
import { BackButtonDirective } from '../directives/back-button.directive';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import {
  FileDropComponent,
  UploadFile,
} from '../shared/file-drop/file-drop.component';
import { OfficeStore } from '../store/office.store';
import { MatOption } from '@angular/material/core';
import { provideYearMonthDateAdapter } from '../util/adapter/app-date.provider';
import { EnvService } from '../services/env.service';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { IDocument } from '../document/document';
import { ICommon } from '../interfaces/common';

type StatementForm = {
  office: FormControl<IOfficeAll | undefined>;
  date: FormControl<Date>;
};

@Component({
  selector: 'app-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatOption,
    MatIcon,
    MatButton,
    MatSuffix,
    ReactiveFormsModule,
    TranslatePipe,
    MatAutocomplete,
    MatError,
    MatAutocompleteTrigger,
    BackButtonDirective,
    FileDropComponent,
  ],
  providers: [...provideYearMonthDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementComponent {
  config = input.required<ICommon>();
  statement = input<IDocument | undefined>();

  submitData = output<{ officeId: string; blob: Blob; fileName: string }>();

  private readonly env: EnvService = inject(EnvService);
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );
  private readonly officeStore = inject(OfficeStore);
  private readonly driveAccessService: DriveAccessService =
    inject(DriveAccessService);

  private allOfficesSignal = signal<IOfficeAll[] | undefined>(undefined);

  isLoading = this.officeStore.isLoading;
  blob = signal<Blob | undefined>(undefined);
  fileName = signal<string | undefined>(undefined);
  file = signal<UploadFile | undefined>(undefined);

  form: FormGroup<StatementForm> = this.formBuilder.group<StatementForm>({
    office: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    date: this.formBuilder.control(getNowTimeZone(), {
      validators: [Validators.required],
    }),
  });

  filteredOfficeSignal = toSignal(
    this.getForm.office.valueChanges.pipe(
      startWith(''),
      map((value: any) =>
        !value || typeof value === 'string' ? value : value.code,
      ),
      combineLatestWith(toObservable(this.allOfficesSignal)),
      map(([name, offices]) => {
        if (name) {
          return this.filterOffice(name, offices ?? []);
        } else {
          return offices ? offices.slice() : offices;
        }
      }),
    ),
  );

  private selectedOfficeSignal = toSignal(this.getForm.office.valueChanges);
  private readonly selectedDateSignal = toSignal(
    this.getForm.date.valueChanges,
  );

  constructor() {
    this.officeStore.loadMyOffices();

    effect(() => {
      const data = this.officeStore.data();
      this.allOfficesSignal.set(data?.kind === 'list' ? data.value : undefined);
    });

    effect(() => {
      const officeControl = this.getForm.office;
      const dateControl = this.getForm.date;
      const selected = this.statement();
      if (selected) {
        this.form.patchValue(selected);
        this.file.set({ name: selected.name, progress: 100, size: 0 });
        officeControl.disable({ emitEvent: false });
        dateControl.disable({ emitEvent: false });
      } else {
        officeControl.enable({ emitEvent: false });
        dateControl.enable({ emitEvent: false });
      }
    });

    effect(() => {
      const offices = this.allOfficesSignal();
      if (offices?.length === 1) {
        this.getForm.office.setValue(offices[0]);
      }
    });

    effect(() => {
      this.driveAccessService.requestAccessIfNeeded(
        this.env.googleDriveUploadFile,
      );
    });

    effect(() => {
      const date = this.selectedDateSignal();
      if (date && this.blob()) {
        this.fileName.set(`Statement_${invoiceFormat(newDate(date))}.pdf`);
      } else {
        this.fileName.set(undefined);
      }
    });
  }

  get getForm(): StatementForm {
    return this.form.controls;
  }

  get getConfig(): ICommon {
    return this.config();
  }

  submit() {
    const officeId = this.selectedOfficeSignal()?.id;
    const blob = this.blob();
    const fileName = this.fileName();
    if (!blob || !officeId || !fileName) {
      return;
    }
    this.submitData.emit({ officeId, blob, fileName });
  }

  keyDownHandler = (event: KeyboardEvent): void => {
    if (this.getForm.office.disabled) {
      return;
    }

    if (event.code === 'Backspace') {
      this.getForm.office.setValue(undefined);
    }
  };

  displayFnOffice = (office: IOfficeAll): string => (office ? office.name : '');

  setMonthAndYear = (
    normalizedMonthAndYear: Date,
    datepicker: Pick<MatDatepicker<Date>, 'close'>,
  ): void => {
    const ctrlValue = new Date(this.getForm.date.value);
    ctrlValue?.setMonth(normalizedMonthAndYear.getMonth());
    ctrlValue?.setFullYear(normalizedMonthAndYear.getFullYear());

    this.getForm.date.setValue(ctrlValue);

    datepicker.close();
  };

  onSelectedFile = (currentFile?: UploadFile): void => {
    const file = currentFile?.raw;
    if (file) {
      this.blob.set(new Blob([file], { type: file.type }));
    } else {
      this.blob.set(undefined);
      this.file.set(undefined);
    }
  };

  private filterOffice = (
    name: string,
    offices: IOfficeAll[],
  ): IOfficeAll[] | undefined =>
    offices?.filter(
      (option) => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0,
    );
}
