import { ChangeDetectionStrategy, Component, effect, Injectable, input, output } from '@angular/core';
import {
  CalendarUtils,
  CalendarWeekViewComponent,
  CalendarWeekViewCurrentTimeMarkerComponent,
  CalendarWeekViewEventComponent,
  CalendarWeekViewHourSegmentComponent,
  ClickDirective,
  DateAdapter,
  getWeekViewPeriod,
  provideCalendar,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import {
  CalendarEvent,
  EventColor,
  GetWeekViewArgs,
  WeekView,
  WeekViewAllDayEvent,
  WeekViewTimeEvent,
} from 'calendar-utils';
import { DragEndEvent, DraggableDirective, DragMoveEvent, DroppableDirective } from 'angular-draggable-droppable';
import { Day } from '@app/reservation/reservation';
import { ConvertHMPipe } from '@app/pipes/convert-hm.pipe';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { ResizableDirective, ResizeHandleDirective } from 'angular-resizable-element';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';

export interface IProfessional {
  id: string;
  name: string;
  img: string;
  color: EventColor;
  reservations: number;
  time: number;
}

export class Professional implements IProfessional {
  id: string;
  name: string;
  img: string;
  color: EventColor;
  reservations: number;
  time: number;

  constructor(id: string, name: string, img: string, color: EventColor) {
    this.id = id;
    this.name = name;
    this.img = img;
    this.color = color;
    this.reservations = 0;
    this.time = 0;
  }
}

interface DayViewScheduler extends WeekView {
  professionals: IProfessional[];
}

interface GetWeekViewArgsWithProfessionals extends GetWeekViewArgs {
  professionals: IProfessional[];
}

@Injectable()
export class DayViewSchedulerCalendarUtils extends CalendarUtils {
  getWeekView = (args: GetWeekViewArgsWithProfessionals): DayViewScheduler => {
    const { period } = super.getWeekView(args);
    const view: DayViewScheduler = {
      period,
      allDayEventRows: [],
      hourColumns: [],
      professionals: [...args.professionals],
    };

    view.professionals.forEach((professional, columnIndex) => {
      const events = args.events?.filter((event) => event.meta.professional.id === professional.id);
      const columnView = super.getWeekView({
        ...args,
        events,
      });
      view.hourColumns.push(columnView.hourColumns[0]);
      columnView.allDayEventRows.forEach(({ row }, rowIndex) => {
        view.allDayEventRows[rowIndex] = view.allDayEventRows[rowIndex] || {
          row: [],
        };
        view.allDayEventRows[rowIndex].row.push({
          ...row[0],
          offset: columnIndex,
          span: 1,
        });
      });
    });

    return view;
  };
}

@Component({
  selector: 'app-mwl-day-view-scheduler',
  templateUrl: './day-view-scheduler.component.html',
  styleUrls: ['./dashboard-event.component.scss'],
  imports: [MatIcon, NgClass, DatePipe, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle,
    ConvertHMPipe, DatePipe, NgClass, TitleCasePipe, CalendarWeekViewHourSegmentComponent,
    CalendarWeekViewCurrentTimeMarkerComponent, DroppableDirective, DraggableDirective, ResizableDirective,
    ResizeHandleDirective, CalendarWeekViewEventComponent, ClickDirective],
  providers: [
    provideCalendar({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    {
      provide: CalendarUtils,
      useClass: DayViewSchedulerCalendarUtils,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayViewSchedulerComponent extends CalendarWeekViewComponent {
  day = input.required<Day>();
  professionals = input<IProfessional[]>([]);

  professionalChanged = output<{ event: CalendarEvent; newProfessional: IProfessional; }>();
  segmentClicked = output<{ date: Date; professionalId: string; }>();

  view!: DayViewScheduler;

  daysInWeek = 1;

  constructor() {
    super();
    effect(() => {
      this.professionals();
      this.refreshBody();
      this.emitBeforeViewRender();
    });
  }

  private get schedulerUtils(): DayViewSchedulerCalendarUtils {
    return this.utils as DayViewSchedulerCalendarUtils;
  }

  trackByProfessionalId = (_: number, row: IProfessional) => row.id;

  getDayColumnWidth = (
    eventRowContainer: HTMLElement,
  ): number => Math.floor(eventRowContainer.offsetWidth / this.professionals.length);

  dragMove = (dayEvent: WeekViewTimeEvent, dragEvent: DragMoveEvent): void => {
    if (this.snapDraggedEvents) {
      const professional = this.getDraggedProfessionalColumn(dayEvent, dragEvent.x);
      const newEventTimes = this.getDragMovedEventTimes(dayEvent, { ...dragEvent, x: 0 }, this.dayColumnWidth, true);
      const originalEvent = dayEvent.event;
      const adjustedEvent = {
        ...originalEvent,
        ...newEventTimes,
        meta: { ...originalEvent.meta, professional },
      };
      const tempEvents = this.events.map((event) => event === originalEvent ? adjustedEvent : event);
      this.restoreOriginalEvents(tempEvents, new Map([[adjustedEvent, originalEvent]]));
    }
    this.dragAlreadyMoved = true;
  };

  dragEnded = (
    weekEvent: WeekViewAllDayEvent | WeekViewTimeEvent,
    dragEndEvent: DragEndEvent,
    dayWidth: number,
    useY = false,
  ): void => {
    super.dragEnded(weekEvent,
      {
        ...dragEndEvent,
        x: 0,
      }, dayWidth, useY);
    const newProfessional = this.getDraggedProfessionalColumn(weekEvent, dragEndEvent.x);
    if (newProfessional && newProfessional !== weekEvent.event.meta.professional) {
      this.professionalChanged.emit({ event: weekEvent.event, newProfessional });
    }
  };

  segmentClick = (date: Date, index: number): void => {
    const professionalId = this.view.professionals[index].id;
    this.segmentClicked.emit({ date, professionalId });
  };

  protected getWeekView = (events: CalendarEvent[]): DayViewScheduler => {
    const day = this.day();
    this.dayStartHour = day.dayStartHour;
    this.dayStartMinute = day.dayStartMinute;
    this.dayEndHour = day.dayEndHour;
    this.dayEndMinute = day.dayEndMinute;
    this.hourSegments = 4;
    return this.schedulerUtils.getWeekView({
      professionals: this.professionals(),
      events,
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn,
      excluded: this.excludeDays,
      precision: this.precision,
      absolutePositionedEvents: true,
      hourSegments: this.hourSegments,
      dayStart: {
        hour: this.dayStartHour,
        minute: this.dayStartMinute,
      },
      dayEnd: {
        hour: this.dayEndHour,
        minute: this.dayEndMinute,
      },
      segmentHeight: this.hourSegmentHeight,
      weekendDays: this.weekendDays,
      ...getWeekViewPeriod(
        this.dateAdapter,
        this.viewDate,
        this.weekStartsOn,
        this.excludeDays,
        this.daysInWeek,
      ),
    });
  };

  private getDraggedProfessionalColumn = (
    dayEvent: WeekViewTimeEvent | WeekViewAllDayEvent,
    xPixels: number,
  ): IProfessional => {
    const columnsMoved = Math.round(xPixels / this.dayColumnWidth);
    const currentColumnIndex = this.view.professionals
      .findIndex((professional) => professional === dayEvent.event.meta.professional);
    const newIndex = currentColumnIndex + columnsMoved;
    return this.view.professionals[newIndex];
  };
}
