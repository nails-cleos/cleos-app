import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IUser, IUserAll, PAGE_SIZE } from '../../interfaces/user';
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
import { Pagination } from '../../interfaces/pagination';
import { TranslateService } from '@ngx-translate/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Role } from '../../interfaces/token';

enum RoleIconName {
  ROLE_CUSTOMER = 'perm_identity',
  ROLE_PROFESSIONAL = 'manage_accounts',
  ROLE_ADMIN = 'supervisor_account'
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

  displayedColumns: string[] = ['position', 'name', 'username', 'email', 'provider', 'status', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IUser>>();
  subscription: Subscription | undefined;
  expandedUser: IUser | undefined;
  getState: Observable<any>;

  allRole: Role[] = [Role.Customer, Role.Professional, Role.Admin];
  error: any;

  resultsLength = 0;
  pageSize = PAGE_SIZE;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectUserState);
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.getUsers();
      // this.paginator.pageIndex = 0;
    });

    this.paginator?.page.subscribe(() => {
      this.getUsers();
    });

    this.getUsers();
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  edit(user: IUser): void {
    this.store.dispatch(
      new fromActionsUser.UserSelected({user, profile: false})
    );
  }

  delete(user: IUser): void {
    this.noExpanded(user);
    const title = this.translate.instant('USER.DELETED.TITLE');
    const content = this.translate.instant('USER.DELETED.CONTENT', {firstName: user.firstName, lastName: user.lastName});
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
    const content = this.translate.instant('USER.ACTIVATION_RESEND.CONTENT', {firstName: user.firstName, lastName: user.lastName});
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
    // @ts-ignore
    return RoleIconName[name];
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

  private getUsers(): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      page: this.paginator ? this.paginator.pageIndex : 0
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
