import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Pagination } from '../../interfaces/pagination';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectUnavailableState } from '../../store/app.states';
import * as fromActionsUnavailable from '../../store/unavailable.actions';
import { DialogComponent } from '../../dialog/dialog.component';
import { convertDuration } from '../../util/dates';
import { IUnavailable, PAGE_SIZE } from '../../interfaces/unavailable';

@Component({
  selector: 'app-unavailable-list',
  templateUrl: './unavailable-list.component.html',
  styleUrls: ['./unavailable-list.component.scss']
})
export class UnavailableListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'professional', 'description', 'start', 'duration', 'repeat', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IUnavailable>>();
  subscription: Subscription | undefined;
  getState: Observable<any>;

  resultsLength = 0;
  pageSize = PAGE_SIZE;
  error: any;

  language: string;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectUnavailableState);
    this.language = this.translate.currentLang;
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.getUnavailableList();
    });

    this.paginator?.page.subscribe(() => {
      this.getUnavailableList();
    });

    this.getUnavailableList();
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  edit(unavailable: IUnavailable): void {
    this.store.dispatch(
      new fromActionsUnavailable.UnavailableSelected(unavailable)
    );
  }

  delete(unavailable: IUnavailable): void {
    const title = this.translate.instant('UNAVAILABLE.DELETED.TITLE');
    const content = this.translate.instant('UNAVAILABLE.DELETED.CONTENT', {name: unavailable.start});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: unavailable}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsUnavailable.DeleteUnavailable(result.id)
        );
      }
    });
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
            this.getUnavailableList();
          });
        } else {
          this.error = stateValue.error;
          return;
        }
      }
      this.dataSource = stateValue.data?.content?.map((unavailable: IUnavailable) => {
        if (unavailable.duration) {
          const duration = convertDuration(unavailable.duration);

          return Object.assign({}, unavailable, {hour: duration.hour, minute: duration.minute});
        }
        return unavailable;
      });
      this.resultsLength = stateValue.data?.totalElements;
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsUnavailable.Clean()
    );
  }

  private getUnavailableList(): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      page: this.paginator ? this.paginator.pageIndex : 0
    };
    this.store.dispatch(
      new fromActionsUnavailable.GetAll(payload)
    );
  }
}
