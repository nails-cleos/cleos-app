import { Component, computed, effect, inject, viewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { toSignal } from '@angular/core/rxjs-interop';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../interfaces/pagination';
import { DocumentState } from '../store/reducers/document.reducers';
import { cleanDocument, documentDownloadZip, documentView, getDocumentsPage } from '../store/document.actions';
import { DriveAccessService } from '../services/drive-access.service';
import { SharedModule } from '../shared/shared.module';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { requireMatch } from '../util/validators';
import { IOfficeAll } from '../interfaces/office';
import { map, startWith } from 'rxjs/operators';
import { combineLatestWith } from 'rxjs';
import { IDocument } from '../interfaces/document';
import { OfficeState } from '../store/reducers/office.reducers';
import { getMyOfficesPipe } from '../store/selectors/office.selectors';
import { getDocumentResponsePipe, getDocumentsPagePipe } from '../store/selectors/document.selectors';
import { DateAdapter } from '@angular/material/core';
import { YearMonthAdapter } from '../util/adapter/year-month.adapter';
import { getDateFormat, getDateQuarter, getNowTimeZone, monthViewTitle } from '../util/dates';
import { MatDatepicker } from '@angular/material/datepicker';
import { EnvService } from '../services/env.service';

type DocumentsForm = {
  office: FormControl<IOfficeAll | undefined>;
  date: FormControl<Date | undefined>;
};

@Component({
  selector: 'app-document',
  imports: [SharedModule],
  templateUrl: './document.component.html',
  providers: [{ provide: DateAdapter, useClass: YearMonthAdapter }],
  styleUrl: './document.component.scss',
})
export class DocumentComponent {
  private readonly env: EnvService = inject(EnvService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<DocumentState | OfficeState> = inject(Store<DocumentState | OfficeState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly driveAccessService: DriveAccessService = inject(DriveAccessService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private documentList$ = this.store.pipe(getDocumentsPagePipe);
  private response$ = this.store.pipe(getDocumentResponsePipe);
  private allOffices$ = this.store.pipe(getMyOfficesPipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'date', 'desc');

  private allOfficesSignal = toSignal(this.allOffices$);
  private documentListSignal = toSignal(this.documentList$);
  private responseSignal = toSignal(this.response$);
  private breakpointsSignal = toSignal(
    this.breakpointObserver$, {
      initialValue: {
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
        },
      },
    },
  );

  paginatorPageIndex = this.tableState.pageIndex;
  dataSourceSignal = computed(() => this.documentListSignal()?.content ?? []);
  resultsLengthSignal = computed(() => this.documentListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'name', 'date', 'type', 'actions'];

  expandedDocument?: IDocument;

  language: string = this.translate.getCurrentLang();

  form: FormGroup<DocumentsForm> = this.formBuilder.group<DocumentsForm>({
    office: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    date: this.formBuilder.control(undefined, {
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
    ),
  );

  private selectedOffice = toSignal(this.getForm.office.valueChanges);
  private selectedDate = toSignal(this.getForm.date.valueChanges);

  constructor() {
    effect(() => {
      const officeId = this.selectedOffice()?.id;
      const date = this.selectedDate();
      if (!officeId || !date) {
        return;
      }
      const request = this.tableState.baseRequest();
      this.store.dispatch(
        getDocumentsPage({
          ...request,
          officeId,
          date: getDateFormat(date),
          size: this.pageSizeSignal(),
        }),
      );
    });
    this.tableState.resetOn(this.responseSignal, () => this.store.dispatch(cleanDocument()));

    effect(() => {
      const data = this.dataSourceSignal()?.[0]?.id;
      if (!data) {
        return;
      }
      this.driveAccessService.requestAccessIfNeeded(this.googleDriveUploadFile);
    });

    effect(() => {
      const offices = this.allOfficesSignal();
      if (offices?.length === 1) {
        this.getForm.office.setValue(offices[0]);
      }
    });
  }

  get getForm(): DocumentsForm {
    return this.form.controls;
  }

  get googleDriveUploadFile(): boolean {
    return this.env.googleDriveUploadFile;
  }

  setMonthAndYear = (normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>): void => {
    const ctrlValue = new Date(this.getForm.date.value || getNowTimeZone());
    ctrlValue?.setMonth(normalizedMonthAndYear.getMonth());
    ctrlValue?.setFullYear(normalizedMonthAndYear.getFullYear());

    this.getForm.date.setValue(ctrlValue);

    datepicker.close();
  };

  download = (document: IDocument): void => this.store.dispatch(
    documentView({ id: document.id, fileName: document.name }),
  );

  downloadZip = (): void => {
    const office = this.selectedOffice();
    const date = this.selectedDate();
    if (!office || !date) {
      return;
    }
    const fileName = `${office.name} Q${getDateQuarter(date)} ${monthViewTitle(date)}.zip`;
    this.store.dispatch(documentDownloadZip({ officeId: office.id, date: getDateFormat(date), fileName }));
  };

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.office.setValue(undefined);
    }
  };

  displayFnOffice = (office: IOfficeAll): string => office ? office.name : '';

  private filterOffice = (name: string, offices: IOfficeAll[]): IOfficeAll[] | undefined => offices?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
