import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { ICurrency } from '../../interfaces/currency';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AppState, selectCurrencyState } from '../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import * as fromActionsCurrency from '../../store/currency.actions';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { detailExpandAnimation } from '../../util/animation';
import { executeDialogNoWidth } from '../../util/helper';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.scss'],
  animations: [detailExpandAnimation],
  imports: [SharedModule],
})
export class CurrencyListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'code', 'name', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<ICurrency>>();
  expanded?: ICurrency;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  language: string;

  private subscription?: Subscription;
  private paginatorSubscription?: Subscription;
  private getState: Observable<any>;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>, public dialog: MatDialog,
              private cdRef: ChangeDetectorRef, breakpointObserver: BreakpointObserver) {
  	breakpointObserver.observe([
  		Breakpoints.XSmall,
  		Breakpoints.Small,
  	]).subscribe(result => {
  		if (result.matches) {
  			this.pageSize = MOBILE_PAGE_SIZE;
  		}
  	});
  	this.getState = this.store.select(selectCurrencyState);
  	this.language = this.translate.currentLang;
  }

  ngAfterViewInit(): void {
  	this.getCurrency();
  }

  ngOnInit(): void {
  	this.clean();
  	this.subscribe();
  }

  ngOnDestroy(): void {
  	this.subscription?.unsubscribe();
  	this.paginatorSubscription?.unsubscribe();
  }

  edit = (currency: ICurrency): void => this.store.dispatch(new fromActionsCurrency.CurrencySelected(currency));

  delete = (currency: ICurrency): void => {
  	const title = this.translate.instant('CURRENCY.DELETED.TITLE');
  	const content = this.translate.instant('CURRENCY.DELETED.CONTENT', { code: currency.code });
  	executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: currency }, result => {
  		if (result) {
  			this.store.dispatch(
  				new fromActionsCurrency.DeleteCurrency(result),
  			);
  		}
  	});
  };

  private clean = (): void => this.store.dispatch(new fromActionsCurrency.Clean());

  private createPageSubscriptions = (): void => {
  	this.sort.sortChange.subscribe(() => {
  		this.paginator.pageIndex = 0;
  		this.getCurrency();
  	});
  	this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getCurrency(this.paginator.pageIndex));

  	this.cdRef.detectChanges();
  };

  private getCurrency = (page: number = 0): void => this.store.dispatch(
  	new fromActionsCurrency.GetAll({
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
  			this.getCurrency();
  		}
  		this.dataSource = state.data?.content;
  		this.resultsLength = state.data?.totalElements;
  		if (!this.paginatorSubscription && this.resultsLength) {
  			this.createPageSubscriptions();
  		}
  	});
  };
}
