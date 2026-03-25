import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { DiscountType, IUserDiscount } from '../../../interfaces/discount';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { cleanDiscount, getMyDiscountsPage } from '../../../store/discount.actions';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SharedModule } from '../../../shared/shared.module';
import { currencySymbol } from '../../../util/helper';
import { getDiscountResponsePipe, getMyDiscountPaginationPipe } from '../../../store/selectors/discount.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DiscountState } from '../../../store/reducers/discount.reducers';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-me-discount',
  templateUrl: './me-discount.component.html',
  styleUrls: ['./me-discount.component.scss'],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeDiscountComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<DiscountState> = inject(Store<DiscountState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly router: Router = inject(Router);
  private readonly firebaseService = inject(FirebaseService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private discountList$ = this.store.pipe(getMyDiscountPaginationPipe);
  private response$ = this.store.pipe(getDiscountResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  private discountListSignal = toSignal(this.discountList$);
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

  private sortActive = computed(() => this.sort()?.active ?? 'discountCustomer.name');
  private sortDirection = computed(() => this.sort()?.direction ?? 'asc');

  paginatorPageIndex = signal(0);
  dataSourceSignal = computed(() => this.discountListSignal()?.content?.map((ud: IUserDiscount) => {
    if (ud && ud.discountCustomer) {
      let symbol;
      switch (ud.discountCustomer.type) {
        case DiscountType.money:
          symbol = currencySymbol(ud.discountCustomer.discount?.currency);
          break;
        case DiscountType.percentage:
          symbol = '%';
          break;
      }
      return Object.assign({}, ud, { symbol });
    }
    return ud;
  }));
  resultsLengthSignal = computed(() => this.discountListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'discountCustomer.name', 'discountCustomer.amount', 'used', 'actions'];

  private readonly language: string = this.translate.getCurrentLang();

  constructor() {
    this.firebaseService.logEvent('screen_view', {
      // eslint-disable-next-line camelcase
      firebase_screen: 'Referral page',
      // eslint-disable-next-line camelcase
      firebase_screen_class: 'ReferralsComponent',
    });
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
        getMyDiscountsPage({
          page: page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
        }),
      );
    });

    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(cleanDiscount());
        this.paginator()?.firstPage();
      }
    });
  }

  useDiscount = (discount: IUserDiscount): void => {
    const data = { discountId: discount.id };
    this.router.navigate([this.language, 'me', 'reservation'], { state: data });
  };
}
