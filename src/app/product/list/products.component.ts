import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { IProduct, IProductGroup } from '../../interfaces/product';
import { Observable, Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { AppState, selectProductState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsProduct from '../../store/product.actions';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { detailExpandAnimation } from '../../util/animation';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  animations: [detailExpandAnimation]
})
export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'name', 'durability', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IProductGroup>>();

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  expanded?: IProductGroup;
  language: string;

  private subscription?: Subscription;
  private paginatorSubscription?: Subscription;
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
    this.language = this.translate.currentLang;
    this.getState = this.store.select(selectProductState);
  }

  ngAfterViewInit(): void {
    this.getProducts();
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  delete(product: IProduct): void {
    const title = this.translate.instant('PRODUCT.DELETED.TITLE');
    const content = this.translate.instant('PRODUCT.DELETED.CONTENT', {name: product.name});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: product}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsProduct.DeleteProduct(result.id)
        );
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((stateValue) => {
      if (stateValue.message) {
        this.clean();
        this.getProducts();
      }
      this.dataSource = stateValue.data?.content;
      this.resultsLength = stateValue.data?.totalElements;
      if (!this.paginatorSubscription && this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsProduct.Clean()
    );
  }

  private createPageSubscriptions(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getProducts();
    });
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getProducts(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private getProducts(page: number = 0): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      page
    };
    this.store.dispatch(
      new fromActionsProduct.GetAll(payload)
    );
  }
}
