import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { IRoom } from '../../interfaces/room';
import { Observable } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../../store/app.states';
import * as fromActionsRoom from '../../store/room.actions';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { IUser } from '../../interfaces/user';
import { getUserName } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private cdRef: ChangeDetectorRef, private breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
      }
    });
    this.getState = this.store.select(selectRoomState);
  }

  ngAfterViewInit(): void {
    this.getRooms();
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
  }

  getProfessionalName(professional: IUser): string {
    return getUserName(professional);
  }

  subscribe(): void {
    this.getState.subscribe((stateValue) => {
      if (stateValue.message) {
        this.clean();
        this.getRooms();
      }
      this.dataSource = stateValue.data?.content;
      this.resultsLength = stateValue.data?.totalElements;
      if (this.resultsLength) {
        this.createPageSubscriptions();
      }
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

  private createPageSubscriptions(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getRooms();
    });
    this.paginator?.page.subscribe(() => this.getRooms(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private getRooms(page: number = 0): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      page
    };
    this.store.dispatch(
      new fromActionsRoom.GetAll(payload)
    );
  }
}
