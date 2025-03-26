import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IUser, IUserAll, User } from '../../interfaces/user';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsUser from '../../store/user.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { TranslateService } from '@ngx-translate/core';
import { Role } from '../../interfaces/token';
import { executeDialogNoWidth, snakeToCamel } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { detailExpandAnimation } from '../../util/animation';
import { RoleIconKey, RoleIconName } from '../../util/icon';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { requireMatch } from '../../util/validators';
import { map, startWith } from 'rxjs/operators';
import { SharedModule } from "../../shared/shared.module";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [detailExpandAnimation],
  standalone: true,
  imports: [SharedModule]
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'displayName', 'email', 'status', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IUser>>();

  expandedUser?: IUser;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  filter?: string;
  language: string;

  private subscription?: Subscription;
  private paginatorSubscription?: Subscription;
  private getState: Observable<any>;
  private allRole: Role[] = [Role.customer, Role.professional, Role.manager, Role.admin];
  private smallScreen = false;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private router: Router, private cdRef: ChangeDetectorRef, breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
        this.smallScreen = true;
      }
    });
    this.getState = this.store.select(selectUserState);
    this.language = this.translate.currentLang;
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

  applyFilter = (event: Event): void => {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filter = filterValue.trim().toLowerCase();
    this.getUsers(0);
  }

  edit = (user: IUser): void => this.store.dispatch(new fromActionsUser.UserSelected({ user, profile: false }));

  delete = (user: IUser): void => {
    this.noExpanded(user);
    const title = this.translate.instant('USER.DELETED.TITLE');
    const content = this.translate.instant('USER.DELETED.CONTENT', { displayName: user.displayName });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsUser.DeleteUser(result)
        );
      }
    });
  }

  sendInvite = (user: IUser): void => {
    this.noExpanded(user);
    const title = this.translate.instant('USER.ACTIVATION_RESEND.TITLE');
    const content = this.translate.instant('USER.ACTIVATION_RESEND.CONTENT', { displayName: user.displayName });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsUser.ResendToken(result.id)
        );
      }
    });
  }

  restore = (user: IUser): void => {
    this.noExpanded(user);
    const title = this.translate.instant('USER.RESTORE.TITLE');
    const content = this.translate.instant('USER.RESTORE.CONTENT', { displayName: user.displayName });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: user }
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

  merge = (user: IUser): void => {
    this.noExpanded(user);
    const data = {
      small: this.smallScreen,
      newUser: user
    };

    executeDialogNoWidth(this.dialog, SelectUserDialogComponent, data, result => {
      if (result) {
        this.store.dispatch(
          new fromActionsUser.MergeUsers({ oldUserId: result.id, newUserId: user.id })
        );
      }
    }, true);
  }

  getIcon = (name: any): any => {
    const iconName: RoleIconKey = snakeToCamel(name) as RoleIconKey;
    return RoleIconName[iconName];
  }

  addRole = (user: IUserAll, role: Role): void => this.store.dispatch(
    new fromActionsUser.SetRole({ user, role, action: 'ADD' })
  );

  removeRole = (user: IUserAll, role: string): void => this.store.dispatch(
    new fromActionsUser.SetRole({ user, role, action: 'REMOVE' })
  );

  book = (customer: IUser): void => {
    const data = { customer };
    this.router.navigate([this.translate.currentLang, 'reservation'], { state: data });
  }

  private clean = (): void => this.store.dispatch(new fromActionsUser.Clean());

  private createPageSubscriptions = (): void => {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getUsers();
    });
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getUsers(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private noExpanded = (user: IUser): void => {
    if (this.expandedUser) {
      this.expandedUser = undefined;
    } else {
      this.expandedUser = user;
    }
  }

  private getUsers = (page: number = 0): void => this.store.dispatch(
    new fromActionsUser.GetAll({
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      filter: this.filter,
      page
    })
  );

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((stateValue) => {
      if (stateValue.message) {
        this.clean();
        this.getUsers();
      }
      this.dataSource = stateValue.data?.content?.map((user: IUserAll) => {
        if (user.authorities) {
          const missing = this.allRole.filter(au => !user.authorities.some(u => u.authority === au));
          return Object.assign({}, user, { missing });
        }
        return user;
      });
      this.resultsLength = stateValue.data?.totalElements;
      if (this.resultsLength && !this.paginatorSubscription) {
        this.createPageSubscriptions();
      } else if (!this.resultsLength) {
        this.paginatorSubscription?.unsubscribe();
        this.paginatorSubscription = undefined;
      }
    });
  }
}

@Component({
  selector: 'app-select-user-dialog-component',
  templateUrl: './select-user-dialog.component.html',
  standalone: true,
  imports: [SharedModule]
})
export class SelectUserDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  userForm!: UntypedFormGroup;
  users?: IUser[];
  filteredUser?: Observable<IUser[] | undefined>;
  user: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  newUser: IUserAll;

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(public dialogRef: MatDialogRef<SelectUserDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: UntypedFormBuilder, private store: Store<AppState>,
              private cdRef: ChangeDetectorRef) {
    this.newUser = data.newUser;
    this.getState = this.store.select(selectUserState);
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    return this.dialogRef.close(this.user.value);
  }

  ngOnInit(): void {
    this.createFilters();
    this.createForm();
    this.subscribe();
    this.getOldUsers();
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFnUser = (user: IUser): string => user?.displayName ? user.displayName : '';

  keyDownHandler = (event: any): void => {
    if (event.code === 'Backspace') {
      this.user.setValue('');
    }
  }

  private createForm = (): void => {
    this.userForm = this.formBuilder.group({ user: this.user });
  }

  private createFilters = (): void => {
    this.filteredUser = this.user.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(name => name ? this.filterUser(name) : this.users ? this.users.slice() : this.users)
    );
  }

  private filterUser = (name: string): IUser[] | undefined => this.users?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private getOldUsers = (): void => this.store.dispatch(new fromActionsUser.GetAllDisableUsers());

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      this.users = state.users?.filter((it: IUser) => it.id !== this.newUser.id);
      this.user.setValue(null);
    });
  }
}

