import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { combineLatestWith } from 'rxjs';
import { Store } from '@ngrx/store';
import { getNowTimeZone, invoiceFormat } from '../util/dates';
import { map, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { IOfficeAll } from '../interfaces/office';
import { requireMatch } from '../util/validators';
import { SharedModule } from '../shared/shared.module';
import { toSignal } from '@angular/core/rxjs-interop';
import { StatementState } from '../store/reducers/statement.reducers';
import { DriveAccessService } from '../services/drive-access.service';
import { BackButtonDirective } from '../directives/back-button.directive';
import { YearMonthAdapter } from '../util/adapter/year-month.adapter';
import { MatDatepicker } from '@angular/material/datepicker';
import { FileDropComponent, UploadFile } from '../shared/file-drop/file-drop.component';
import { uploadStatement } from '../store/statement.actions';
import { getMyOfficesPipe } from '../store/selectors/office.selectors';
import { OfficeState } from '../store/reducers/office.reducers';
import { DateAdapter } from '@angular/material/core';
import { EnvService } from '../services/env.service';

type StatementForm = {
  office: FormControl<IOfficeAll | undefined>;
  date: FormControl<Date>;
};

@Component({
  selector: 'app-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.scss'],
  imports: [SharedModule, BackButtonDirective, FileDropComponent],
  providers: [{ provide: DateAdapter, useClass: YearMonthAdapter }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementComponent {
  private readonly env: EnvService = inject(EnvService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly store: Store<StatementState | OfficeState> = inject(Store<StatementState | OfficeState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly driveAccessService: DriveAccessService = inject(DriveAccessService);

  private allOffices$ = this.store.pipe(getMyOfficesPipe);

  private allOfficesSignal = toSignal(this.allOffices$);

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
      combineLatestWith(this.allOffices$),
      map(([name, offices]) => {
        if (name) {
          return this.filterOffice(name, offices);
        } else {
          return offices ? offices.slice() : offices;
        }
      }),
    ));

  private selectedOfficeSignal = toSignal(this.getForm.office.valueChanges);

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  constructor() {
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
    this.store.dispatch(uploadStatement({ blob, officeId, fileName }));
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
