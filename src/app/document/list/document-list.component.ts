import { Component, computed, effect, inject, input, output, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslatePipe } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { DriveAccessService } from '../../services/drive-access.service';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { requireMatch } from '../../util/validators';
import { IOfficeAll } from '../../office/office';
import { map, startWith } from 'rxjs/operators';
import { combineLatestWith } from 'rxjs';
import { DocumentTypeEnum, IDocument } from '../document';
import { DocumentStore } from '../../store/document.store';
import { OfficeStore } from '../../store/office.store';
import { MatOption } from '@angular/material/core';
import { provideYearMonthDateAdapter } from '../../util/adapter/app-date.provider';
import { getDateQuarter, getNowTimeZone, monthViewTitle } from '../../util/dates';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { EnvService } from '../../services/env.service';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem, MatListItemIcon, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { TableSkeletonColumn, TableSkeletonComponent } from '../../shared/skeleton/table-skeleton.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';

type DocumentsForm = {
  office: FormControl<IOfficeAll | undefined>;
  date: FormControl<Date | undefined>;
};

@Component({
  selector: 'app-document-list',
  imports: [MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatDatepicker, MatOption,
    MatIcon, MatList, MatListItem, MatListSubheaderCssMatStyler, MatIconButton, MatButton, ReactiveFormsModule,
    TranslatePipe, DatePipe, MatAutocomplete, MatError, MatTable, MatSort, MatColumnDef, MatHeaderCellDef,
    MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatTooltip, MatListItemIcon, MatFooterCellDef, MatFooterCell,
    MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPaginator, MatSuffix,
    MatAutocompleteTrigger, TableSkeletonComponent, SkeletonComponent],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [...provideYearMonthDateAdapter()],
})
export class DocumentListComponent {
  types = input<DocumentTypeEnum[]>();
  showDateFilter = input<boolean>(true);
  navigationButtons = input<boolean>(false);

  onAdd = output<void>();
  onEdit = output<IDocument>();
  onDelete = output<IDocument>();

  private readonly env: EnvService = inject(EnvService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly officeStore = inject(OfficeStore);
  private readonly documentStore = inject(DocumentStore);
  private readonly driveAccessService: DriveAccessService = inject(DriveAccessService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'date', 'desc');

  private allOfficesSignal = computed(() => {
    const data = this.officeStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });
  private dataSignal = this.documentStore.data;
  private responseSignal = this.documentStore.response;
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
  isLoading = this.documentStore.isLoading;
  isOfficeLoading = this.officeStore.isLoading;
  dataSourceSignal = computed(() => this.dataSignal()?.content ?? []);
  resultsLengthSignal = computed(() => this.dataSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'name' },
    { key: 'date', hideOnMobile: true },
    { key: 'type' },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);

  expandedDocument?: IDocument;

  form: FormGroup<DocumentsForm> = this.formBuilder.group<DocumentsForm>({
    office: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    date: this.formBuilder.control(getNowTimeZone()),
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
    ),
  );

  private selectedOffice = toSignal(this.getForm.office.valueChanges);
  private selectedDate = toSignal(this.getForm.date.valueChanges);

  constructor() {
    this.documentStore.clean();
    this.officeStore.loadMyOffices();

    effect(() => {
      const dateControl = this.getForm.date;

      if (this.showDateFilter()) {
        dateControl.setValidators(Validators.required);

        if (!dateControl.value) {
          dateControl.setValue(getNowTimeZone(), { emitEvent: false });
        }
      } else {
        dateControl.clearValidators();
        dateControl.setValue(undefined, { emitEvent: false });
      }

      dateControl.updateValueAndValidity({ emitEvent: false });
    });

    effect(() => {
      const officeId = this.selectedOffice()?.id;
      const showDateFilter = this.showDateFilter();
      const date = showDateFilter ? this.selectedDate() : undefined;

      if (!officeId || (showDateFilter && !date)) {
        return;
      }

      this.documentStore.loadPage({
        ...this.tableState.baseRequest(),
        officeId,
        size: this.pageSizeSignal(),
        date,
        types: this.types(),
      });
    });

    this.tableState.resetOn(this.responseSignal, () => this.documentStore.clearResponse());

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

  download = (document: IDocument): void => this.documentStore.download({ id: document.id, fileName: document.name });

  add = (): void => {
    this.onAdd.emit();
  };

  edit = (document: IDocument): void => {
    this.onEdit.emit(document);
  };

  delete = (document: IDocument): void => {
    this.onDelete.emit(document);
  };

  downloadZip = (): void => {
    const office = this.selectedOffice();
    const date = this.selectedDate();
    if (!office || !date) {
      return;
    }
    const fileName = `${ office.name } Q${ getDateQuarter(date) } ${ monthViewTitle(date) }.zip`;
    this.documentStore.downloadZip({ officeId: office.id, date, fileName });
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
