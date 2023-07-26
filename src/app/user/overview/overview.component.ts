import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import { IUserAll } from '../../interfaces/user';
import { getUserImage, getUserName, getUserNameInitials } from '../../util/helper';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsUser from '../../store/user.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { IReservationOverview } from '../../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { IChart } from '../../interfaces/dashboard';
import { formatDateTime, newDateTimestamp } from '../../util/dates';
import { isDarkMode } from '../../util/theme';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {
  error: any;
  image: any;
  user: IUserAll | undefined;
  initials: string | undefined;
  username: string | undefined;

  miniCardData: IReservationOverview[] = [{} as IReservationOverview, {} as IReservationOverview];
  charts: IChart[] = [{} as IChart, {} as IChart];

  upcoming: number[] = [];
  isDark?: boolean;
  language: string;

  layout = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
    Breakpoints.Medium
  ]).pipe(
    map((r) => {
      if (r.breakpoints[Breakpoints.Medium]) {
        return {
          columns: 2,
          miniCard: { cols: 1, rows: 1 },
          chart: { cols: 2, rows: 2 }
        };
      }

      if (r.matches) {
        return {
          columns: 1,
          miniCard: { cols: 1, rows: 1 },
          chart: { cols: 1, rows: 2 }
        };
      }

      return {
        columns: 4,
        miniCard: { cols: 1, rows: 1 },
        chart: { cols: 2, rows: 2 }
      };
    })
  );

  private subscription: Subscription | undefined;
  private getState: Observable<any>;

  constructor(private breakpointObserver: BreakpointObserver, private route: ActivatedRoute,
              private store: Store<AppState>, private translate: TranslateService, private router: Router) {
    this.getState = this.store.select(selectUserState);
    this.language = this.translate.currentLang;
  }

  get notification(): void {
    let message: string;
    if (this.upcoming.length === 1) {
      const date = formatDateTime(newDateTimestamp(this.upcoming[0]), this.language);
      message = this.translate.instant('WHATSAPP.SEND.APPROVE', { date });
    } else {
      message = this.translate.instant('WHATSAPP.SEND.FOLLOWINGS.TITLE');
      this.upcoming.forEach(r => {
        const date = formatDateTime(newDateTimestamp(r), this.language);
        message += this.translate.instant('WHATSAPP.SEND.FOLLOWINGS.VALUE', { date });
      });
      message += this.translate.instant('WHATSAPP.SEND.ATTENTION');
    }
    const userPhone = this.user?.phone;
    window.open(`https://api.whatsapp.com/send?phone=+${ userPhone }&text=${ message }`, '_blank');
    return;
  }

  ngOnInit(): void {
    this.getUserOverview();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state && state.data) {
        this.user = state.data.customer;
        this.isDark = isDarkMode(state.user?.theme);
        this.image = getUserImage(this.user);
        this.initials = getUserNameInitials(this.user);
        this.username = getUserName(this.user);
        if (state.data.upcomingList) {
          this.upcoming = state.data.upcomingList;
        }
        if (state.data.miniCardOverview) {
          this.miniCardData = state.data.miniCardOverview?.map((ro: IReservationOverview) => {
            if (ro.primaryId || ro.secondaryId) {
              return Object.assign({}, ro, { link: (id: string | undefined) => !id || this.router.navigate(['reservation', id]) });
            }
            return ro;
          });
        }
        if (state.data.chartOverview && state.data.chartOverview.length) {
          this.error = state.error_message;
          this.charts = state.data.chartOverview;
        }
      }
    });
  }

  private getUserOverview(): void {
    if (!this.user) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsUser.UserOverview(id)
      );
    }
  }
}
