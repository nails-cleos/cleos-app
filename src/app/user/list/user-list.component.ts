import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { IUser, IUserAll, User } from '../../interfaces/user';
import { Store } from '@ngrx/store';
import {
  cleanUser,
  deleteUser,
  getUsersPage,
  mergeUsers,
  resendToken,
  restore,
  setRole,
  userSelected,
} from '../../store/user.actions';
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
import { Router, RouterLink } from '@angular/router';
import { getUserPaginationPipe, getUserResponsePipe } from '../../store/selectors/user.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserState } from '../../store/reducers/user.reducers';
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
  MatListItemIcon, MatListItemTitle,
  MatListSubheaderCssMatStyler,
} from '@angular/material/list';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { LowerCasePipe, NgClass } from '@angular/common';

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
    MatDivider, LowerCasePipe, MatListItemTitle],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<UserState> = inject(Store<UserState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly router: Router = inject(Router);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private userList$ = this.store.pipe(getUserPaginationPipe);
  private response$ = this.store.pipe(getUserResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'displayName', 'asc');

  private userListSignal = toSignal(this.userList$);
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
  dataSourceSignal = computed(() => this.userListSignal()?.content?.map((user: IUserAll) => {
    if (user.authorities) {
      const missing = this.allRole.filter(au => !user.authorities.some(u => u.authority === au));
      return Object.assign({}, user, { missing });
    }
    return user;
  }));

  resultsLengthSignal = computed(() => this.userListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);
  smallScreen = computed(() => this.breakpointsSignal()?.matches ?? false);

  displayedColumns: string[] = ['position', 'displayName', 'email', 'status', 'actions'];

  expandedUser?: IUserAll;

  language: string = this.translate.getCurrentLang();

  form: FormGroup<UsersForm> = this.formBuilder.group<UsersForm>({
    filter: this.formBuilder.control(undefined),
  });

  private selectedFilter = toSignal(this.getForm.filter.valueChanges);

  private allRole: Role[] = [Role.customer, Role.professional, Role.manager, Role.admin];

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      const filter = this.selectedFilter()?.trim()?.toLowerCase();
      this.store.dispatch(
        getUsersPage({
          ...request,
          size: this.pageSizeSignal(),
          filter,
        }),
      );
    });
    this.tableState.resetOn(this.responseSignal, () => this.store.dispatch(cleanUser()));
  }

  get getForm(): UsersForm {
    return this.form.controls;
  }

  edit = (selected: IUserAll): void => this.store.dispatch(userSelected({ selected }));

  delete = (user: IUserAll): void => {
    this.noExpanded(user);
    const title = this.translate.instant('USER.DELETED.TITLE');
    const content = this.translate.instant('USER.DELETED.CONTENT', { displayName: user.displayName });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: user, variant: 'warning' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(deleteUser({ id: result.id, displayName: result.displayName }));
      }
    });
  };

  sendInvite = (user: IUserAll): void => {
    this.noExpanded(user);
    const title = this.translate.instant('USER.ACTIVATION_RESEND.TITLE');
    const content = this.translate.instant('USER.ACTIVATION_RESEND.CONTENT', { displayName: user.displayName });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: user },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          resendToken({ id: result.id }),
        );
      }
    });
  };

  restore = (user: IUserAll): void => {
    this.noExpanded(user);
    const title = this.translate.instant('USER.RESTORE.TITLE');
    const content = this.translate.instant('USER.RESTORE.CONTENT', { displayName: user.displayName });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: user },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const restoreUser: IUser = new User();
        restoreUser.id = result.id;
        restoreUser.deleted = false;
        this.store.dispatch(
          restore({ id: restoreUser.id!, user: restoreUser }),
        );
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
        this.store.dispatch(
          mergeUsers({ oldUserId: result.id, newUserId: user.id }),
        );
      }
    }, true);
  };

  getIcon = (name: any): any => {
    const iconName: RoleIconKey = snakeToCamel(name) as RoleIconKey;
    return RoleIconName[iconName];
  };

  addRole = (user: IUserAll, role: Role): void => this.store.dispatch(
    setRole({ id: user.id, displayName: user.displayName, role, action: 'ADD' }),
  );

  removeRole = (user: IUserAll, role: Role): void => this.store.dispatch(
    setRole({ id: user.id, displayName: user.displayName, role, action: 'REMOVE' }),
  );

  book = (customer: IUser): void => {
    const data = { customerId: customer.id };
    this.router.navigate([this.translate.getCurrentLang(), 'reservation'], { state: data });
  };

  private noExpanded = (user: IUserAll): void => {
    if (this.expandedUser) {
      this.expandedUser = undefined;
    } else {
      this.expandedUser = user;
    }
  };
}
