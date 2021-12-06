import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IUser, IUserAll, User } from '../../interfaces/user';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsUser from '../../store/user.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { TranslateService } from '@ngx-translate/core';
import { Role } from '../../interfaces/token';
import { getUserName, snakeToCamel } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { detailExpandAnimation } from '../../util/animation';
import { RoleIconKey, RoleIconName } from '../../util/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [detailExpandAnimation]
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'name', 'username', 'email', 'provider', 'status', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IUser>>();

  expandedUser: IUser | undefined;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  filter: string | undefined;

  private subscription: Subscription | undefined;
  private paginatorSubscription: Subscription | undefined;
  private getState: Observable<any>;
  private allRole: Role[] = [Role.customer, Role.professional, Role.admin];

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private router: Router, private cdRef: ChangeDetectorRef, private breakpointObserver: BreakpointObserver) {
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
    this.clean();
    this.subscribe();
  }

  ngAfterViewInit(): void {
    this.getUsers();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  getUsername(user: IUser): string {
    return getUserName(user);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filter = filterValue.trim().toLowerCase();
    this.getUsers(0);
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

  restore(user: IUser): void {
    this.noExpanded(user);
    const title = this.translate.instant('USER.RESTORE.TITLE');
    const content = this.translate.instant('USER.RESTORE.CONTENT', {username: getUserName(user)});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: user}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const restoreUser: IUser = new User();
        restoreUser.id = result.id;
        restoreUser.deleted = false;
        this.store.dispatch(
          new fromActionsUser.RestoreUser(restoreUser)
        );
      }
    });
  }

  getIcon(name: any): any {
    const iconName: RoleIconKey = snakeToCamel(name) as RoleIconKey;
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

  book(customer: IUser): void {
    const data = {customer};
    this.router.navigate(['reservation'], {state: data});
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
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getUsers(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private getUsers(page: number = 0): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      filter: this.filter,
      page
    };
    this.store.dispatch(
      new fromActionsUser.GetAll(payload)
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((stateValue) => {
      if (stateValue.message) {
        this.clean();
        this.getUsers();
      }
      this.dataSource = stateValue.data?.content?.map((user: IUserAll) => {
        if (user.authorities) {
          const missing = this.allRole.filter(au => !user.authorities.some(u => u.authority === au));
          return Object.assign({}, user, {missing});
        }
        return user;
      });
      this.resultsLength = stateValue.data?.totalElements;
      if (this.resultsLength && !this.paginatorSubscription) {
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
