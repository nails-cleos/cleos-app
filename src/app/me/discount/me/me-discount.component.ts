import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../../interfaces/pagination';
import { DiscountType, IUserDiscount } from '../../../interfaces/discount';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectDiscountState } from '../../../store/app.states';
import * as fromActionsDiscount from '../../../store/discount.actions';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-me-discount',
  templateUrl: './me-discount.component.html',
  styleUrls: ['./me-discount.component.scss'],
  imports: [SharedModule],
})
export class MeDiscountComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'discountCustomer.name', 'discountCustomer.amount', 'used', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IUserDiscount>>();

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  private subscription?: Subscription;
  private paginatorSubscription?: Subscription;
  private getState: Observable<any>;
  private readonly language: string;

  constructor(private translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private router: Router, private cdRef: ChangeDetectorRef, private analytic: Analytics,
              breakpointObserver: BreakpointObserver) {
  	breakpointObserver.observe([
  		Breakpoints.XSmall,
  		Breakpoints.Small,
  	]).subscribe(result => {
  		if (result.matches) {
  			this.pageSize = MOBILE_PAGE_SIZE;
  		}
  	});
  	this.getState = this.store.select(selectDiscountState);
  	logEvent(this.analytic, 'screen_view', {
  		// eslint-disable-next-line camelcase
  		firebase_screen: 'Referral page',
  		// eslint-disable-next-line camelcase
  		firebase_screen_class: 'ReferralsComponent',
  	});
  	this.language = this.translate.currentLang;
  }

  ngAfterViewInit(): void {
  	this.getDiscounts();
  }

  ngOnInit(): void {
  	this.clean();
  	this.subscribe();
  }

  ngOnDestroy(): void {
  	this.subscription?.unsubscribe();
  	this.paginatorSubscription?.unsubscribe();
  }

  useDiscount = (discount: IUserDiscount): void => {
  	const data = { discount };
  	this.router.navigate([this.language, 'me', 'reservation'], { state: data });
  };

  private clean = (): void => this.store.dispatch(new fromActionsDiscount.Clean());

  private createPageSubscriptions = (): void => {
  	this.sort.sortChange.subscribe(() => {
  		this.paginator.pageIndex = 0;
  		this.getDiscounts();
  	});
  	this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getDiscounts(this.paginator.pageIndex));

  	this.cdRef.detectChanges();
  };

  private getDiscounts = (page: number = 0): void => this.store.dispatch(
  	new fromActionsDiscount.GetMyDiscounts({
  		active: this.sort.active,
  		direction: this.sort.direction,
  		size: this.pageSize,
  		page,
  	}),
  );

  private subscribe = (): void => {
  	this.subscription = this.getState.subscribe(state => {
  		if (state.message) {
  			this.clean();
  			this.getDiscounts();
  		}
  		this.dataSource = state.data?.content?.map((ud: IUserDiscount) => {
  			if (ud && ud.discountCustomer) {
  				let symbol;
  				switch (ud.discountCustomer.type) {
  				case DiscountType.money:
  					symbol = `$ ${ ud.discountCustomer.amount }`;
  					break;
  				case DiscountType.percentage:
  					symbol = `${ ud.discountCustomer.amount } %`;
  					break;
  				}
  				return Object.assign({}, ud, { symbol });
  			}
  			return ud;
  		});
  		this.resultsLength = state.data?.totalElements;
  		if (!this.paginatorSubscription && this.resultsLength) {
  			this.createPageSubscriptions();
  		}
  	});
  };
}
