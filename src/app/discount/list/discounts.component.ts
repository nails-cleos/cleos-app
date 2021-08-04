import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { DiscountType, IDiscount, IDiscountAll } from '../../interfaces/discount';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectDiscountState, selectUserState } from '../../store/app.states';
import * as fromActionsDiscount from '../../store/discount.actions';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import * as fromActionsUser from '../../store/user.actions';
import { IUser, IUserAll } from '../../interfaces/user';
import { map, startWith } from 'rxjs/operators';
import { getFullUserName, getUserName } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-discounts',
  templateUrl: './discounts.component.html',
  styleUrls: ['./discounts.component.scss']
})
export class DiscountsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'name', 'description', 'type', 'amount', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IDiscount>>();
  subscription: Subscription | undefined;
  getState: Observable<any>;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

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
    this.getState = this.store.select(selectDiscountState);
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
  }

  edit(discount: IDiscount): void {
    this.store.dispatch(
      new fromActionsDiscount.DiscountSelected(discount)
    );
  }

  delete(discount: IDiscount): void {
    const title = this.translate.instant('DISCOUNT.DELETED.TITLE');
    const content = this.translate.instant('DISCOUNT.DELETED.CONTENT', {name: discount.name});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: discount}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsDiscount.DeleteDiscount(result.id)
        );
      }
    });
  }

  sentToUsers(discount: IDiscount): void {
    const dialogRef = this.dialog.open(DiscountDialogComponent, {
      width: '70vw',
      disableClose: true,
      data: {
        discount
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsDiscount.AddDiscount(result)
        );
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((stateValue) => {
      if (stateValue.message) {
        this.clean();
        this.getDiscounts();
      }
      this.dataSource = stateValue.data?.content;
      this.resultsLength = stateValue.data?.totalElements;
      if (this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsDiscount.Clean()
    );
  }

  private createPageSubscriptions(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getDiscounts();
    });
    this.paginator?.page.subscribe(() => this.getDiscounts(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private getDiscounts(page: number = 0): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      page
    };
    this.store.dispatch(
      new fromActionsDiscount.GetAll(payload)
    );
  }
}

@Component({
  selector: 'app-discount-dialog-component',
  templateUrl: './discount-dialog.component.html',
  styleUrls: ['./discount-dialog.component.scss']
})
export class DiscountDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('customerInput') customerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  getState: Observable<any>;
  subscription: Subscription | undefined;
  discount: IDiscountAll;
  title: string | undefined;
  customerCtrl = new FormControl();
  filteredCustomers: Observable<IUser[] | undefined> | undefined;
  customers: IUserAll[] = [];
  allCustomers: IUserAll[] | undefined;

  constructor(public dialogRef: MatDialogRef<DiscountDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private store: Store<AppState>, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectUserState);
    this.discount = data.discount;
    this.setSymbol();
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.getCustomers();
    this.filteredCustomers = this.customerCtrl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(name => name ? this.filter(name) : (this.allCustomers ? this.allCustomers.slice() : this.allCustomers))
    );
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  doAction(): void {
    const customerIds = this.customers.map(({id}) => id);
    this.dialogRef.close({discountId: this.discount.id, customerIds});
  }

  remove(customer: IUserAll): void {
    const index = this.customers.indexOf(customer);
    if (index >= 0) {
      this.customers.splice(index, 1);
      this.allCustomers?.push(customer);
      this.customerCtrl.setValue(null);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const customer = event.option.value;
    this.customers.push(customer);
    this.allCustomers = this.allCustomers?.filter(c => c.id !== customer.id);
    this.customerInput.nativeElement.value = '';
    this.customerCtrl.setValue(null);
  }

  sortCustomers(data: any): IUser[] {
    return data.sort((a: any, b: any) => {
      const aName = getFullUserName(a).toUpperCase();
      const bName = getFullUserName(b).toUpperCase();
      return (aName > bName) ? 1 : ((bName > aName) ? -1 : 0);
    });
  }

  getName(customer: any): string {
    return getFullUserName(customer);
  }

  private setSymbol(): void {
    this.title = this.discount.name;
    switch (this.discount.type) {
      case DiscountType.money:
        this.title = `$ ${this.discount.amount} ${this.title}`;
        break;
      case DiscountType.percentage:
        this.title = `${this.discount.amount} % ${this.title}`;
        break;
    }
  }

  private getCustomers(): void {
    this.store.dispatch(
      new fromActionsUser.GetAllCustomers()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.allCustomers = state.data;
      this.customerCtrl.setValue(null);
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsUser.Clean()
    );
  }

  private filter(name: string): IUserAll[] | undefined {
    const filterValue = name.toLowerCase();

    return this.allCustomers?.filter(option => getUserName(option)?.toLowerCase().indexOf(filterValue));
  }
}
