import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { IUser, PAGE_SIZE } from '../interfaces/user';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../store/app.states';
import { Observable, merge, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clean, GetAll, DeleteUser, UserSelected, ResendToken } from '../store/user.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Pagination } from '../interfaces/pagination';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['position', 'name', 'username', 'email', 'provider', 'status', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IUser>>();
  getState: Observable<any>;

  resultsLength = 0;
  pageSize = PAGE_SIZE;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectUserState);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.getUsers();
      // this.paginator.pageIndex = 0;
    });

    this.paginator.page.subscribe(() => {
      this.getUsers();
    });

    this.getUsers();
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
  }

  subscribe(): void {
    this.getState.subscribe((state) => {
      if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });

        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
            this.getUsers();
          });
        }
      }
      this.dataSource = state.data?.content;
      this.resultsLength = state.data?.totalElements;
    });
  }

  clean(): void {
    this.store.dispatch(
      new Clean()
    );
  }

  getUsers(): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      page: this.paginator.pageIndex
    };
    this.store.dispatch(
      new GetAll(payload)
    );
  }

  edit(user: IUser): void {
    this.store.dispatch(
      new UserSelected(user)
    );
  }

  delete(user: IUser): void {
    const title = this.translate.instant('USER.DELETED.TITLE');
    const content = this.translate.instant('USER.DELETED.CONTENT', {firstName: user.firstName, lastName: user.lastName});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: user}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new DeleteUser(result.id)
        );
      }
    });
  }

  sendInvite(user: IUser): void {
    const title = this.translate.instant('USER.ACTIVATION_RESEND.TITLE');
    const content = this.translate.instant('USER.ACTIVATION_RESEND.CONTENT', {firstName: user.firstName, lastName: user.lastName});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: user}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new ResendToken(result.id)
        );
      }
    });
  }
}
