import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { IAvailability, IRoom } from '../../interfaces/room';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { cleanRoom, deleteRoom, getRoomsPage, roomSelected } from '../../store/room.actions';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { findDayOfWeek, getTimeZone, ITimeZone } from '../../util/dates';
import { executeDialogNoWidth } from '../../util/helper';
import { SharedModule } from '../../shared/shared.module';
import { SortByPipe } from '../../pipes/sort-by.pipe';
import { RoomState } from '../../store/reducers/room.reducers';
import { getRoomResponsePipe, getRoomPaginationPipe } from '../../store/selectors/room.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
  imports: [SharedModule, SortByPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomsComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<RoomState> = inject(Store<RoomState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private roomList$ = this.store.pipe(getRoomPaginationPipe);
  private response$ = this.store.pipe(getRoomResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  private roomListSignal = toSignal(this.roomList$);
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

  private sortActive = computed(() => this.sort()?.active ?? 'office');
  private sortDirection = computed(() => this.sort()?.direction ?? 'asc');

  paginatorPageIndex = signal(0);
  dataSourceSignal = computed(() => this.roomListSignal()?.content?.map((room: IRoom) => {
    if (room && room.availabilities && room.availabilities.length) {
      const availabilities = room.availabilities.map((i: IAvailability) =>
        Object.assign({}, i, { order: findDayOfWeek(i.day) }));
      return Object.assign({}, room, { availabilities });
    }
    return room;
  }));
  resultsLengthSignal = computed(() => this.roomListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'currency', 'office', 'address', 'timeZone', 'availability', 'actions', 'add'];
  expanded?: IRoom;

  language: string = this.translate.getCurrentLang();

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
      this.store.dispatch(
        getRoomsPage({
          page: page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
        }),
      );
    });

    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(cleanRoom());
        this.paginator()?.firstPage();
      }
    });
  }

  getTimeZone = (timeZone?: string): ITimeZone => getTimeZone(timeZone);

  getGMT = (timeZone?: string): string => this.getTimeZone(timeZone).gmt;

  edit = (selected: IRoom): void => this.store.dispatch(roomSelected({ selected, redirect: true }));

  delete = (room: IRoom): void => {
    const title = this.translate.instant('ROOM.DELETED.TITLE');
    const content = this.translate.instant('ROOM.DELETED.CONTENT', { name: room.address?.name });
    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: room, variant: 'warning' }, result => {
      if (result) {
        this.store.dispatch(deleteRoom({ id: result.id, room: result }));
      }
    });
  };
}
