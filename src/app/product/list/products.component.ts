import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Pagination } from '../../interfaces/pagination';
import { IProduct, PAGE_SIZE } from '../../interfaces/product';
import { Observable, Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppState, selectProductState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsProduct from '../../store/product.actions';
import { DialogComponent } from '../../dialog/dialog.component';
import { ConvertDuration } from '../../util/dates';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns: string[] = ['position', 'name', 'description', 'price', 'duration', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IProduct>>();
  subscription: Subscription | undefined;
  getState: Observable<any>;

  resultsLength = 0;
  pageSize = PAGE_SIZE;
  error: string | undefined;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectProductState);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.getProducts();
    });

    this.paginator.page.subscribe(() => {
      this.getProducts();
    });

    this.getProducts();
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  edit(product: IProduct): void {
    this.store.dispatch(
      new fromActionsProduct.ProductSelected(product)
    );
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
      if (stateValue.errorMessage || stateValue.message) {
        const snackBarRef = this.snackBar.open(stateValue.errorMessage || stateValue.message, 'OK', {
          duration: 5000
        });

        if (stateValue.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
            this.getProducts();
          });
        } else {
          this.error = stateValue.error;
          return;
        }
      }
      this.dataSource = stateValue.data?.content?.map((product: IProduct) => {
        if (product.duration) {
          const duration = ConvertDuration(product.duration);

          return Object.assign({}, product, {hour: duration.hour, minute: duration.minute});
        }
        return product;
      });
      this.resultsLength = stateValue.data?.totalElements;
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsProduct.Clean()
    );
  }

  private getProducts(): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      page: this.paginator.pageIndex
    };
    this.store.dispatch(
      new fromActionsProduct.GetAll(payload)
    );
  }
}
