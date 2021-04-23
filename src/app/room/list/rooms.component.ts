import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Pagination } from '../../interfaces/pagination';
import { IRoom, PAGE_SIZE } from '../../interfaces/room';
import { Observable } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../../store/app.states';
import * as fromActionsRoom from '../../store/room.actions';
import { DialogComponent } from '../../dialog/dialog.component';
import { GeocodeService } from '../../services/geocode.service';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'name', 'professional', 'address', 'availability', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IRoom>>();
  getState: Observable<any>;

  resultsLength = 0;
  pageSize = PAGE_SIZE;
  error: any;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private cdRef: ChangeDetectorRef, private geocodeService: GeocodeService) {
    this.getState = this.store.select(selectRoomState);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.getRooms();
    });

    this.paginator?.page.subscribe(() => {
      this.getRooms();
    });

    this.getRooms();
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
  }

  subscribe(): void {
    this.getState.subscribe((stateValue) => {
      if (stateValue.errorMessage || stateValue.message) {
        const snackBarRef = this.snackBar.open(stateValue.errorMessage || stateValue.message, 'OK', {
          duration: 5000
        });

        if (stateValue.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
            this.getRooms();
          });
        } else {
          this.error = stateValue.error;
        }
      }
      this.dataSource = stateValue.data?.content;
      this.resultsLength = stateValue.data?.totalElements;
    });
  }

  edit(room: IRoom): void {
    this.store.dispatch(
      new fromActionsRoom.RoomSelected({room, redirect: true})
    );
  }

  delete(room: IRoom): void {
    const title = this.translate.instant('ROOM.DELETED.TITLE');
    const content = this.translate.instant('ROOM.DELETED.CONTENT', {name: room.name});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: room}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsRoom.DeleteRoom(result.id)
        );
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsRoom.Clean()
    );
  }

  private getRooms(): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      page: this.paginator ? this.paginator.pageIndex : 0
    };
    this.store.dispatch(
      new fromActionsRoom.GetAll(payload)
    );
  }
}
