import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { getDisplayNameInitials, getUserImage } from '@app/util/helper';
import { IReservationOverview } from '@app/reservation/reservation';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IChart } from '@app/dashboard/dashboard';
import { formatDateTime, newDateTimestamp } from '@app/util/dates';
import { IAccountAll } from '@app/account/account';
import { IUserAll } from '../user';
import { AuthUserService } from '@app/services/auth-user.service';
import { ErrorComponent } from '@app/shared/error/error.component';
import { CardComponent } from '@app/shared/card/card.component';
import { ChartComponent } from '@app/shared/chart/chart.component';
import { GoogleMapComponent } from '@app/shared/google-map/google-map.component';
import { BackButtonDirective } from '@app/directives/back-button.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { MatCard, MatCardContent } from '@angular/material/card';
import { AvatarComponent } from '@app/shared/avatar/avatar.component';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { UserStore } from '@app/store/user.store';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  imports: [
    MatIcon,
    MatButton,
    TranslatePipe,
    CurrencyPipe,
    BackButtonDirective,
    MatCard,
    MatCardContent,
    ErrorComponent,
    CardComponent,
    ChartComponent,
    GoogleMapComponent,
    BackButtonDirective,
    AvatarComponent,
    MatMiniFabButton,
    MatGridList,
    MatGridTile,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  id = input<string>();

  private readonly breakpointObserver: BreakpointObserver =
    inject(BreakpointObserver);
  private readonly userStore = inject(UserStore);
  private readonly navigationService: NavigationService =
    inject(NavigationService);
  private readonly translateService: TranslateService =
    inject(TranslateService);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private breakpointObserver$ = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
  ]);
  private authUserSignal = this.authUserService.authUser;
  private breakpointsSignal = toSignal(this.breakpointObserver$, {
    initialValue: {
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    },
  });

  private hasAdminRole = computed(
    () => this.authUserSignal()?.hasAdminRole ?? false,
  );
  private userId = computed(() => this.id() ?? 'me');

  overviewSignal = this.userStore.overview;
  errorSignal = this.userStore.error;
  isLoadingSignal = this.userStore.isLoading;

  image: any;
  initials?: string;

  miniCardData = signal<IReservationOverview[]>([]);
  charts = signal<IChart[]>([]);
  readonly miniCardSkeletons = Array.from({ length: 4 }, (_, index) => index);
  readonly chartSkeletons = Array.from({ length: 2 }, (_, index) => index);

  upcoming: number[] = [];
  readonly language = this.navigationService.language;

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

  chartColumns = computed(() => (this.breakpointsSignal().matches ? 1 : 2));

  constructor() {
    this.userStore.clean();
    effect(() => {
      const id = this.userId();
      if (id) {
        this.userStore.loadOverview(id);
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
          this.miniCardData.set(
            overview.miniCardOverview?.map((ro: IReservationOverview) => {
              if (ro.primaryId || ro.secondaryId) {
                return Object.assign({}, ro, {
                  link: (id: string | undefined) =>
                    !id || this.navigationService.navigate(['reservation', id]),
                });
              }
              return ro;
            }),
          );
        } else {
          this.miniCardData.set([]);
        }
        if (overview.chartOverview?.length) {
          this.charts.set(overview.chartOverview);
        } else {
          this.charts.set([]);
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
    this.navigationService.navigate([
      'accounts',
      this.account?.id,
      'transactions',
      'view',
    ]);
  }

  goToProfile() {
    if (this.hasAdminRole()) {
      this.navigationService.navigate(['users', this.customer?.id]);
    } else {
      this.navigationService.navigate(['auth', 'profile']);
    }
  }

  notification() {
    let message = this.translateService.instant(
      'WHATSAPP.SEND.FOLLOWINGS.TITLE',
    );
    this.upcoming.forEach((r) => {
      const date = formatDateTime(newDateTimestamp(r), this.language);
      message += this.translateService.instant(
        'WHATSAPP.SEND.FOLLOWINGS.VALUE',
        { date },
      );
    });
    message += this.translateService.instant('WHATSAPP.SEND.ATTENTION');
    const userPhone = this.customer?.phone;
    window.open(
      `https://api.whatsapp.com/send?phone=+${userPhone}&text=${message}`,
      '_blank',
    );
  }
}
