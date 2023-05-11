import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { IAvailability, IAvailabilityAll, IRoom } from '../../interfaces/room';
import { Observable, Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../../store/app.states';
import * as fromActionsRoom from '../../store/room.actions';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { detailExpandAnimation } from '../../util/animation';
import { findDayOfWeek, getTimeZone, ITimeZone } from '../../util/dates';
import { executeDialogNoWidth } from '../../util/helper';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
  animations: [detailExpandAnimation]
})
export class RoomsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'currency', 'office', 'address', 'timeZone', 'availability', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IRoom>>();
  expanded?: IRoom;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  private subscription: Subscription | undefined;
  private paginatorSubscription: Subscription | undefined;
  private getState: Observable<any>;

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

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  getTimeZone(timeZone?: string): ITimeZone {
    return getTimeZone(timeZone);
  }

  getGMT(timeZone?: string): string {
    return this.getTimeZone(timeZone).gmt;
  }

  subscribe(): void {
    this.subscription = this.getState.subscribe((stateValue) => {
      if (stateValue.message) {
        this.clean();
        this.getRooms();
      }
      this.dataSource = stateValue.data?.content?.map((r: IRoom) => {
        if (r && r.availabilities && r.availabilities.length) {
          const availabilities = r.availabilities.map((i: IAvailability) =>
            Object.assign({}, i, { order: findDayOfWeek(i.day) }));
          return Object.assign({}, r, { availabilities });
        }
        return r;
      });
      // this.dataSource = stateValue.data?.content?.map((r: any) => {
      //   const map = new Map<string, string[]>();
      //   r.availabilities?.reduce((group: any, item: IAvailabilityAll) => {
      //     const key = `${item.start} - ${item.end}`;
      //     let day: any = group.get(key) || [];
      //     day = [...day, item.day];
      //     group.set(key, day);
      //     return group;
      //   }, map)
      //   return Object.assign({}, r, {times: map})
      // });
      this.resultsLength = stateValue.data?.totalElements;
      if (!this.paginatorSubscription && this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  }

  edit(room: IRoom): void {
    this.store.dispatch(
      new fromActionsRoom.RoomSelected({ roomInfo: { room }, redirect: true })
    );
  }

  delete(room: IRoom): void {
    const title = this.translate.instant('ROOM.DELETED.TITLE');
    const content = this.translate.instant('ROOM.DELETED.CONTENT', { name: room.address?.name });
    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: room }, result => {
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
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getRooms(this.paginator.pageIndex));

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

  sortFn = (a: IAvailabilityAll, b: IAvailabilityAll): number => findDayOfWeek(a.day) - findDayOfWeek(b.day);
}
