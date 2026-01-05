import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
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
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { TranslateService } from '@ngx-translate/core';
import { Role } from '../../interfaces/token';
import { executeDialogNoWidth, snakeToCamel } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { detailExpandAnimation } from '../../util/animation';
import { RoleIconKey, RoleIconName } from '../../util/icon';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { getUserResponsePipe, getUserPaginationPipe } from '../../store/selectors/user.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserState } from '../../store/reducers/user.reducers';
import { SelectUserDialogComponent } from './select-user-dialog.component';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';

type UsersForm = {
  filter: FormControl<string | undefined>;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [detailExpandAnimation],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
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

  private sortActive = computed(() => this.sort()?.active ?? 'displayName');
  private sortDirection = computed(() => this.sort()?.direction ?? 'asc');

  paginatorPageIndex = signal(0);
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

  language: string = this.translate.currentLang;

  form: FormGroup<UsersForm> = this.formBuilder.group<UsersForm>({
    filter: this.formBuilder.control(undefined),
  });

  private selectedFilter = toSignal(this.getForm.filter.valueChanges);

  private allRole: Role[] = [Role.customer, Role.professional, Role.manager, Role.admin];

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
      const page = this.paginatorPageIndex();
      const filter = this.selectedFilter()?.trim()?.toLowerCase();
      this.store.dispatch(
        getUsersPage({
          page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
          filter,
        }),
      );
    });

    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(cleanUser());
        this.paginator()?.firstPage();
      }
    });
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
      data: { title, content, value: user },
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
      small: this.smallScreen,
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
    this.router.navigate([this.translate.currentLang, 'reservation'], { state: data });
  };

  private noExpanded = (user: IUserAll): void => {
    if (this.expandedUser) {
      this.expandedUser = undefined;
    } else {
      this.expandedUser = user;
    }
  };
}
