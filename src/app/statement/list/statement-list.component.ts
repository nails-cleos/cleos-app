import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatestWith } from 'rxjs';
import { getNowTimeZone, invoiceFormat } from '../../util/dates';
import { map, startWith } from 'rxjs/operators';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IOfficeAll } from '../../interfaces/office';
import { requireMatch } from '../../util/validators';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DriveAccessService } from '../../services/drive-access.service';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { FileDropComponent, UploadFile } from '../../shared/file-drop/file-drop.component';
import { StatementStore } from '../../store/statement.store';
import { OfficeStore } from '../../store/office.store';
import { MatOption } from '@angular/material/core';
import { provideYearMonthDateAdapter } from '../../util/adapter/app-date.provider';
import { EnvService } from '../../services/env.service';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';

type StatementForm = {
  office: FormControl<IOfficeAll | undefined>;
  date: FormControl<Date>;
};

@Component({
  selector: 'app-statement-list',
  templateUrl: './statement-list.component.html',
  styleUrls: ['./statement-list.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatDatepicker, MatOption,
    MatIcon, MatButton, MatSuffix, ReactiveFormsModule, TranslatePipe, MatAutocomplete, MatError,
    MatAutocompleteTrigger,
    BackButtonDirective, BackButtonDirective, FileDropComponent],
  providers: [...provideYearMonthDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementListComponent {
  private readonly env: EnvService = inject(EnvService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly officeStore = inject(OfficeStore);
  private readonly statementStore = inject(StatementStore);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly driveAccessService: DriveAccessService = inject(DriveAccessService);

  private allOfficesSignal = signal<IOfficeAll[] | undefined>(undefined);

  blob = signal<Blob | undefined>(undefined);
  fileName = signal<string | undefined>(undefined);

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
      map((value: any) => !value || typeof value === 'string' ? value : value.code),
      combineLatestWith(toObservable(this.allOfficesSignal)),
      map(([name, offices]) => {
        if (name) {
          return this.filterOffice(name, offices ?? []);
        } else {
          return offices ? offices.slice() : offices;
        }
      }),
    ));

  private selectedOfficeSignal = toSignal(this.getForm.office.valueChanges);

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  constructor() {
    this.statementStore.clean();
    this.officeStore.loadMyOffices();

    effect(() => {
      const data = this.officeStore.data();
      this.allOfficesSignal.set(data?.kind === 'list' ? data.value : undefined);
    });

    effect(() => {
      const offices = this.allOfficesSignal();
      if (offices?.length === 1) {
        this.getForm.office.setValue(offices[0]);
      }
    });

    effect(() => {
      this.driveAccessService.requestAccessIfNeeded(this.env.googleDriveUploadFile);
    });
  }

  get getForm(): StatementForm {
    return this.form.controls;
  }

  submit() {
    const officeId = this.selectedOfficeSignal()?.id;
    const blob = this.blob();
    const fileName = this.fileName();
    if (!blob || !officeId || !fileName) {
      return;
    }
    this.statementStore.upload(officeId, blob, fileName);
  }

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.office.setValue(undefined);
    }
  };

  displayFnOffice = (office: IOfficeAll): string => office ? office.name : '';

  setMonthAndYear = (normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>): void => {
    const ctrlValue = new Date(this.getForm.date.value);
    ctrlValue?.setMonth(normalizedMonthAndYear.getMonth());
    ctrlValue?.setFullYear(normalizedMonthAndYear.getFullYear());

    this.getForm.date.setValue(ctrlValue);

    datepicker.close();
  };

  onSelectedFile = (currentFile?: UploadFile): void => {
    const file = currentFile?.raw;
    if (file) {
      this.fileName.set(`Statement_${invoiceFormat(this.getForm.date.value)}.pdf`);
      this.blob.set(new Blob([file], { type: file.type }));
    } else {
      this.fileName.set(undefined);
      this.blob.set(undefined);
    }
  };

  private filterOffice = (name: string, offices: IOfficeAll[]): IOfficeAll[] | undefined => offices?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
