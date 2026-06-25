import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { IUser, IUserAll, User } from '../user';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Role } from '../../interfaces/token';
import { executeDialogNoWidth, snakeToCamel } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RoleIconKey, RoleIconName } from '../../util/icon';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectUserDialogComponent } from './select-user-dialog.component';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
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
import {
  MatDivider,
  MatList,
  MatListItem,
  MatListItemIcon,
  MatListItemTitle,
  MatListSubheaderCssMatStyler,
} from '@angular/material/list';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { LowerCasePipe, NgClass } from '@angular/common';
import { TableSkeletonColumn, TableSkeletonComponent } from '../../shared/skeleton/table-skeleton.component';
import { UserStore } from '../../store/user.store';
import { NavigationService } from '../../services/navigation.service';

type UsersForm = {
  filter: FormControl<string | undefined>;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatIcon, MatList, MatListItem, MatListSubheaderCssMatStyler,
    MatIconButton, MatButton, ReactiveFormsModule, TranslatePipe, NgClass, RouterLink, MatTable, MatSort, MatColumnDef,
    MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatTooltip, MatListItemIcon, MatFooterCellDef,
    MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPaginator,
    MatDivider, LowerCasePipe, MatListItemTitle, TableSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly userStore = inject(UserStore);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'displayName', 'asc');

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
  isLoading = computed(() => this.userStore.isLoading());
  dataSourceSignal = computed(() => this.userStore.data()?.content?.map((user: IUserAll) => {
    if (user.authorities) {
      const missing = this.allRole.filter(au => !user.authorities.some(u => u.authority === au));
      return Object.assign({}, user, { missing });
    }
    return user;
  }));

  resultsLengthSignal = computed(() => this.userStore.data()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);
  smallScreen = computed(() => this.breakpointsSignal()?.matches ?? false);

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'displayName' },
    { key: 'email', hideOnMobile: true },
    { key: 'status' },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);

  expandedUser?: IUserAll;

  readonly language = this.navigationService.language;

  form: FormGroup<UsersForm> = this.formBuilder.group<UsersForm>({
    filter: this.formBuilder.control(undefined),
  });

  private selectedFilter = toSignal(this.getForm.filter.valueChanges);

  private allRole: Role[] = [Role.customer, Role.professional, Role.manager, Role.admin];

  constructor() {
    this.userStore.clean();
    effect(() => {
      const request = this.tableState.baseRequest();
      const filter = this.selectedFilter()?.trim()?.toLowerCase();
      this.userStore.loadPage({
        ...request,
        size: this.pageSizeSignal(),
        filter,
      });
    });
    this.tableState.resetOn(this.userStore.response, () => this.userStore.clean());
  }

  get getForm(): UsersForm {
    return this.form.controls;
  }

  edit = (selected: IUserAll): void => this.userStore.selectAndNavigate(selected);

  delete = (user: IUserAll): void => {
    this.noExpanded(user);
    const title = this.translateService.instant('USER.DELETED.TITLE');
    const content = this.translateService.instant('USER.DELETED.CONTENT', { displayName: user.displayName });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: user, variant: 'warning' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userStore.delete(result.id, result.displayName);
      }
    });
  };

  sendInvite = (user: IUserAll): void => {
    this.noExpanded(user);
    const title = this.translateService.instant('USER.ACTIVATION_RESEND.TITLE');
    const content = this.translateService.instant('USER.ACTIVATION_RESEND.CONTENT', { displayName: user.displayName });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: user },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userStore.resendToken(result.id);
      }
    });
  };

  restore = (user: IUserAll): void => {
    this.noExpanded(user);
    const title = this.translateService.instant('USER.RESTORE.TITLE');
    const content = this.translateService.instant('USER.RESTORE.CONTENT', { displayName: user.displayName });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: user },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const restoreUser: IUser = new User();
        restoreUser.id = result.id;
        restoreUser.deleted = false;
        this.userStore.restore(restoreUser.id!, restoreUser);
      }
    });
  };

  merge = (user: IUserAll): void => {
    this.noExpanded(user);
    const data = {
      small: this.smallScreen(),
      newUser: user,
    };

    executeDialogNoWidth(this.dialog, SelectUserDialogComponent, data, result => {
      if (result) {
        this.userStore.mergeUsers(result.id, user.id);
      }
    }, true);
  };

  getIcon = (name: any): any => {
    const iconName: RoleIconKey = snakeToCamel(name) as RoleIconKey;
    return RoleIconName[iconName];
  };

  addRole = (user: IUserAll, role: Role): void =>
    this.userStore.setRole(user.id, user.displayName, role, 'ADD');

  removeRole = (user: IUserAll, role: Role): void =>
    this.userStore.setRole(user.id, user.displayName, role, 'REMOVE');

  book = (customer: IUser): void => {
    const data = { customerId: customer.id };
    this.navigationService.navigate(['reservation'], { state: data });
  };

  private noExpanded = (user: IUserAll): void => {
    if (this.expandedUser) {
      this.expandedUser = undefined;
    } else {
      this.expandedUser = user;
    }
  };
}
