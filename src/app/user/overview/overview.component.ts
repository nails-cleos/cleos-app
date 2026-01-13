import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { getDisplayNameInitials, getUserImage } from '../../util/helper';
import { getCustomerOverview } from '../../store/user.actions';
import { Router } from '@angular/router';
import { IReservationOverview } from '../../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { IChart } from '../../interfaces/dashboard';
import { formatDateTime, newDateTimestamp } from '../../util/dates';
import { IAccountAll } from '../../interfaces/account';
import { IUserAll } from '../../interfaces/user';
import { AuthUserService } from '../../services/auth-user.service';
import { SharedModule } from '../../shared/shared.module';
import { ErrorComponent } from '../../shared/error/error.component';
import { CardComponent } from '../../shared/card/card.component';
import { ChartComponent } from '../../shared/chart/chart.component';
import { GoogleMapComponent } from '../../shared/google-map/google-map.component';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserState } from '../../store/reducers/user.reducers';
import { getCurrentUserIdPipe, getOverviewPipe, getUserErrorPipe } from '../../store/selectors/user.selectors';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  imports: [SharedModule, ErrorComponent, CardComponent, ChartComponent, GoogleMapComponent, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  private breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private store: Store<UserState> = inject(Store<UserState>);
  private translate: TranslateService = inject(TranslateService);
  private router: Router = inject(Router);
  private authUserService: AuthUserService = inject(AuthUserService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private userId$ = this.store.pipe(getCurrentUserIdPipe);
  private overview$ = this.store.pipe(getOverviewPipe);
  private error$ = this.store.pipe(getUserErrorPipe);

  private authUserSignal = this.authUserService.authUser;
  private userIdSignal = toSignal(this.userId$);
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

  private hasAdminRole = computed(() => this.authUserSignal()?.hasAdminRole ?? false);
  private userId = computed(() => this.userIdSignal());

  overviewSignal = toSignal(this.overview$);
  errorSignal = toSignal(this.error$);

  image: any;
  initials?: string;

  miniCardData: IReservationOverview[] = [{} as IReservationOverview, {} as IReservationOverview];
  charts: IChart[] = [{} as IChart, {} as IChart];

  upcoming: number[] = [];
  language: string = this.translate.getCurrentLang();

  layoutSignal = computed(() => {
    if (this.breakpointsSignal().matches) {
      return {
        columns: 1,
        miniCardInfo: { cols: 1, rows: 2 },
        miniCardAccount: { cols: 1, rows: 1 },
        miniCard: { cols: 1, rows: 1 },
        chart: { cols: 1, rows: 2 },
      };
    }

    return {
      columns: 4,
      miniCardInfo: { cols: 2, rows: 2 },
      miniCardAccount: { cols: 1, rows: 1 },
      miniCard: { cols: 1, rows: 1 },
      chart: { cols: 2, rows: 2 },
    };
  });

  constructor() {
    effect(() => {
      const id = this.userId();
      if (id) {
        this.store.dispatch(getCustomerOverview({ id }));
      }
    });

    effect(() => {
      const overview = this.overviewSignal();
      if (overview) {
        this.image = getUserImage(overview.account?.customer);
        this.initials = getDisplayNameInitials(overview.account?.customer);
        if (overview.upcomingList) {
          this.upcoming = overview.upcomingList;
        }
        if (overview.miniCardOverview) {
          this.miniCardData = overview.miniCardOverview?.map((ro: IReservationOverview) => {
            if (ro.primaryId || ro.secondaryId) {
              return Object.assign({}, ro, {
                link: (id: string | undefined) => !id ||
                  this.router.navigate([this.translate.getCurrentLang(), 'reservation', id]),
              });
            }
            return ro;
          });
        }
        if (overview.chartOverview?.length) {
          this.charts = overview.chartOverview;
        }
      }
    });
  }

  get account(): IAccountAll | undefined {
    return this.overviewSignal()?.account;
  }

  get customer(): IUserAll | undefined {
    return this.overviewSignal()?.account?.customer;
  }

  goTo() {
    this.router.navigate(['/', this.language, 'accounts', this.account?.id, 'transactions', 'view']);
  }

  goToProfile() {
    if (this.hasAdminRole()) {
      this.router.navigate(['/', this.language, 'users', this.customer?.id]);
    } else {
      this.router.navigate(['/', this.language, 'auth', 'profile']);
    }
  }

  notification() {
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
    window.open(`https://api.whatsapp.com/send?phone=+${userPhone}&text=${message}`, '_blank');
  }
}
