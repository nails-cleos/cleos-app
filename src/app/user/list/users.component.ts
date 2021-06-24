import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IUser, IUserAll } from '../../interfaces/user';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as fromActionsUser from '../../store/user.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { TranslateService } from '@ngx-translate/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Role } from '../../interfaces/token';
import { getUserName, snakeToCamel } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

enum RoleIconName {
  roleCustomer = 'perm_identity',
  roleProfessional = 'manage_accounts',
  roleAdmin = 'supervisor_account'
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'name', 'username', 'email', 'provider', 'status', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IUser>>();
  subscription: Subscription | undefined;
  expandedUser: IUser | undefined;
  getState: Observable<any>;

  allRole: Role[] = [Role.customer, Role.professional, Role.admin];
  error: any;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private cdRef: ChangeDetectorRef, private breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
      }
    });
    this.getState = this.store.select(selectUserState);
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
  }

  ngAfterViewInit(): void {
    this.getUsers();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getUsername(user: IUser): string {
    return getUserName(user);
  }

  edit(user: IUser): void {
    this.store.dispatch(
      new fromActionsUser.UserSelected({user, profile: false})
    );
  }

  delete(user: IUser): void {
    this.noExpanded(user);
    const title = this.translate.instant('USER.DELETED.TITLE');
    const content = this.translate.instant('USER.DELETED.CONTENT', {username: getUserName(user)});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: user}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsUser.DeleteUser(result.id)
        );
      }
    });
  }

  sendInvite(user: IUser): void {
    this.noExpanded(user);
    const title = this.translate.instant('USER.ACTIVATION_RESEND.TITLE');
    const content = this.translate.instant('USER.ACTIVATION_RESEND.CONTENT', {username: getUserName(user)});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: user}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsUser.ResendToken(result.id)
        );
      }
    });
  }

  getIcon(name: any): any {
    const iconName = snakeToCamel(name);
    // @ts-ignore
    return RoleIconName[iconName];
  }

  addRole(user: IUserAll, role: Role): void {
    this.store.dispatch(
      new fromActionsUser.SetRole({user, role, action: 'ADD'})
    );
  }

  removeRole(user: IUserAll, role: string): void {
    this.store.dispatch(
      new fromActionsUser.SetRole({user, role, action: 'REMOVE'})
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsUser.Clean()
    );
  }

  private createPageSubscriptions(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getUsers();
    });
    this.paginator?.page.subscribe(() => this.getUsers(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private getUsers(page: number = 0): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      page
    };
    this.store.dispatch(
      new fromActionsUser.GetAll(payload)
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((stateValue) => {
      if (stateValue.errorMessage || stateValue.message) {
        const snackBarRef = this.snackBar.open(stateValue.errorMessage || stateValue.message, 'OK', {
          duration: 5000
        });

        if (stateValue.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
            this.getUsers();
          });
        }
      }
      this.dataSource = stateValue.data?.content?.map((user: IUserAll) => {
        if (user.authorities) {
          const missing = this.allRole.filter(au => !user.authorities.some(u => u.authority === au));
          return Object.assign({}, user, {missing});
        }
        return user;
      });
      this.resultsLength = stateValue.data?.totalElements;
      if (this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  }

  private noExpanded(user: IUser): void {
    if (this.expandedUser) {
      this.expandedUser = undefined;
    } else {
      this.expandedUser = user;
    }
  }
}
