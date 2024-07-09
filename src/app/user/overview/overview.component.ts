import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import { getDisplayNameInitials, getUserImage } from '../../util/helper';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsUser from '../../store/user.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { IReservationOverview } from '../../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { IChart } from '../../interfaces/dashboard';
import { formatDateTime, newDateTimestamp } from '../../util/dates';
import { IAccountAll } from '../../interfaces/account';
import { IUserAll } from '../../interfaces/user';
import { AuthUserService } from '../../services/auth-user.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {
  error: any;
  image: any;
  account?: IAccountAll;
  customer?: IUserAll;
  initials?: string;

  miniCardData: IReservationOverview[] = [{} as IReservationOverview, {} as IReservationOverview];
  charts: IChart[] = [{} as IChart, {} as IChart];

  upcoming: number[] = [];
  language: string;

  layout = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small
  ]).pipe(
    map((r) => {
      if (r.matches) {
        return {
          columns: 1,
          miniCardInfo: { cols: 1, rows: 2 },
          miniCardAccount: { cols: 1, rows: 1 },
          miniCard: { cols: 1, rows: 1 },
          chart: { cols: 1, rows: 2 }
        };
      }

      return {
        columns: 4,
        miniCardInfo: { cols: 2, rows: 2 },
        miniCardAccount: { cols: 1, rows: 1 },
        miniCard: { cols: 1, rows: 1 },
        chart: { cols: 2, rows: 2 }
      };
    })
  );

  private subscription?: Subscription;
  private authUserServiceSubscription: Subscription;
  private getState: Observable<any>;
  private hasAdminRole: boolean;

  constructor(private breakpointObserver: BreakpointObserver, private route: ActivatedRoute, private store: Store<AppState>,
              private translate: TranslateService, private router: Router, private authUserService: AuthUserService) {
    this.getState = this.store.select(selectUserState);
    this.language = this.translate.currentLang;
    this.hasAdminRole = false;
    this.authUserServiceSubscription = this.authUserService.authUser.subscribe(value => this.hasAdminRole = value.hasAdminRole);
  }

  get goTo(): void {
    this.router.navigate(['/', this.language, 'accounts', this.account?.id, 'transactions', 'view']);
    return;
  }

  get goToProfile(): void {
    if (this.hasAdminRole) {
      this.router.navigate(['/', this.language, 'users', this.customer?.id]);
    } else {
      this.router.navigate(['/', this.language, 'auth', 'profile']);
    }
    return;
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
    const userPhone = this.customer?.phone;
    window.open(`https://api.whatsapp.com/send?phone=+${ userPhone }&text=${ message }`, '_blank');
    return;
  }

  ngOnInit(): void {
    this.getUserOverview();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.authUserServiceSubscription.unsubscribe();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state?.data) {
        this.account = state.data.account;
        this.customer = this.account?.customer;
        this.image = getUserImage(this.customer);
        this.initials = getDisplayNameInitials(this.customer);
        if (state.data.upcomingList) {
          this.upcoming = state.data.upcomingList;
        }
        if (state.data.miniCardOverview) {
          this.miniCardData = state.data.miniCardOverview?.map((ro: IReservationOverview) => {
            if (ro.primaryId || ro.secondaryId) {
              return Object.assign({}, ro, {
                link: (id: string | undefined) => !id ||
                  this.router.navigate([this.translate.currentLang, 'reservation', id])
              });
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
    if (!this.account) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsUser.UserOverview(id)
      );
    }
  }
}
