import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { toSignal } from '@angular/core/rxjs-interop';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { cleanColor } from '../../store/color.actions';
import { StatementState } from '../../store/reducers/statement.reducers';
import { getStatementsPage, statementView } from '../../store/statement.actions';
import { getStatementResponsePipe, getStatementsPagePipe } from '../../store/selectors/statement.selectors';
import { DriveAccessService } from '../../services/drive-access.service';
import { SharedModule } from '../../shared/shared.module';
import { detailExpandAnimation } from '../../util/animation';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { requireMatch } from '../../util/validators';
import { IOfficeAll } from '../../interfaces/office';
import { map, startWith } from 'rxjs/operators';
import { combineLatestWith } from 'rxjs';
import { IStatement } from '../../interfaces/statement';
import { OfficeState } from '../../store/reducers/office.reducers';
import { getMyOfficesPipe } from '../../store/selectors/office.selectors';

type StatementsForm = {
  office: FormControl<IOfficeAll | undefined>;
};

@Component({
  selector: 'app-statements',
  imports: [SharedModule],
  animations: [detailExpandAnimation],
  templateUrl: './statements.component.html',
  styleUrl: './statements.component.scss',
})
export class StatementsComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<StatementState | OfficeState> = inject(Store<StatementState | OfficeState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly driveAccessService: DriveAccessService = inject(DriveAccessService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private statementList$ = this.store.pipe(getStatementsPagePipe);
  private response$ = this.store.pipe(getStatementResponsePipe);
  private allOffices$ = this.store.pipe(getMyOfficesPipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  private allOfficesSignal = toSignal(this.allOffices$);
  private statementListSignal = toSignal(this.statementList$);
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
  dataSourceSignal = computed(() => this.statementListSignal()?.content);
  resultsLengthSignal = computed(() => this.statementListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'name', 'date', 'actions'];

  expandedStatement?: IStatement;

  language: string = this.translate.getCurrentLang();

  form: FormGroup<StatementsForm> = this.formBuilder.group<StatementsForm>({
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
        getStatementsPage({
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

  get getForm(): StatementsForm {
    return this.form.controls;
  }

  download = (statement: IStatement): void => this.store.dispatch(statementView(
    { id: statement.id, fileName: statement.name, driveToken: this.driveAccessService.driveTokenSignal() },
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
