import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { toSignal } from '@angular/core/rxjs-interop';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { cleanColor } from '../../store/color.actions';
import { InvoiceState } from '../../store/reducers/invoice.reducers';
import { getInvoicesPage, invoiceView } from '../../store/invoice.actions';
import { getInvoiceResponsePipe, getInvoicesPagePipe } from '../../store/selectors/invoice.selectors';
import { DriveAccessService } from '../../services/drive-access.service';
import { IInvoiceData } from '../../interfaces/invoice';
import { SharedModule } from '../../shared/shared.module';
import { detailExpandAnimation } from '../../util/animation';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { requireMatch } from '../../util/validators';
import { IOfficeAll } from '../../interfaces/office';
import { map, startWith } from 'rxjs/operators';
import { combineLatestWith } from 'rxjs';
import { getMyOfficesPipe } from '../../store/selectors/office.selectors';
import { OfficeState } from '../../store/reducers/office.reducers';

type InvoicesForm = {
  office: FormControl<IOfficeAll | undefined>;
};

@Component({
  selector: 'app-invoices',
  imports: [SharedModule],
  animations: [detailExpandAnimation],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss',
})
export class InvoicesComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<InvoiceState | OfficeState> = inject(Store<InvoiceState | OfficeState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly driveAccessService: DriveAccessService = inject(DriveAccessService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private invoiceList$ = this.store.pipe(getInvoicesPagePipe);
  private response$ = this.store.pipe(getInvoiceResponsePipe);
  private allOffices$ = this.store.pipe(getMyOfficesPipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  private allOfficesSignal = toSignal(this.allOffices$);
  private invoiceListSignal = toSignal(this.invoiceList$);
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

  private sortActive = computed(() => this.sort()?.active ?? 'date');
  private sortDirection = computed(() => this.sort()?.direction ?? 'desc');

  paginatorPageIndex = signal(0);
  dataSourceSignal = computed(() => this.invoiceListSignal()?.content);
  resultsLengthSignal = computed(() => this.invoiceListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'name', 'date', 'actions'];

  expandedInvoice?: IInvoiceData;

  language: string = this.translate.getCurrentLang();

  form: FormGroup<InvoicesForm> = this.formBuilder.group<InvoicesForm>({
    office: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
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

  constructor() {
    effect((onCleanup) => {
      const paginator = this.paginator();
      if (paginator) {
        const sub = paginator.page.subscribe((pageEvent) => {
          this.paginatorPageIndex.set(pageEvent.pageIndex);
        });
        onCleanup(() => sub.unsubscribe());
      }
    });

    effect(() => {
      const officeId = this.selectedOffice()?.id;
      if (!officeId) {
        return;
      }
      const page = this.paginatorPageIndex();
      this.store.dispatch(
        getInvoicesPage({
          officeId,
          page: page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
        }),
      );
    });

    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(cleanColor());
        this.paginator()?.firstPage();
      }
    });

    effect(() => {
      const data = this.dataSourceSignal()?.[0]?.id;
      if (!data) {
        return;
      }
      this.driveAccessService.requestAccessIfNeeded();
    });

    effect(() => {
      const offices = this.allOfficesSignal();
      if (offices?.length === 1) {
        this.getForm.office.setValue(offices[0]);
      }
    });
  }

  get getForm(): InvoicesForm {
    return this.form.controls;
  }

  view = (invoice: IInvoiceData): void => this.store.dispatch(invoiceView(
    { id: invoice.id, fileName: invoice.name, driveToken: this.driveAccessService.driveTokenSignal() },
  ));

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.office.setValue(undefined);
    }
  };

  displayFnOffice = (office: IOfficeAll): string => office ? office.name : '';

  private filterOffice = (name: string, offices: IOfficeAll[]): IOfficeAll[] | undefined => offices?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
