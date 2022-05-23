import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { IProduct, IProductGroup } from '../../interfaces/product';
import { map, startWith } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { ICatalogue, ISlide, Slide } from '../../interfaces/catalogue';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { requireMatch } from '../../util/validators';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectMainState } from '../../store/app.states';
import { ViewportScroller } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IUserAll } from '../../interfaces/user';
import { getUserName } from '../../util/helper';
import { filterDateRoom, getNow, plusMonthDate } from '../../util/dates';
import { MAX_RESERVATION_MONTH } from '../../interfaces/reservation';
import * as fromActionsMain from '../../store/main.actions';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent implements OnInit, OnDestroy {

  isHandset: any;
  slides: ISlide[] = [];

  form!: FormGroup;
  groups: IProductGroup[] | undefined;
  filteredGroup: Observable<IProductGroup[] | undefined> | undefined;
  group: FormControl = new FormControl('', [requireMatch]);
  products: IProduct[] | undefined;
  filteredProduct: Observable<IProduct[] | undefined> | undefined;
  product: FormControl = new FormControl('', [requireMatch]);

  maxDate: Date;
  minDate: Date;
  date: FormControl = new FormControl();

  name: FormControl = new FormControl('', [
    Validators.required
  ]);
  email: FormControl = new FormControl('', [
    Validators.required, Validators.email
  ]);
  subject: FormControl = new FormControl('', [
    Validators.required
  ]);
  body: FormControl = new FormControl('', [
    Validators.required
  ]);

  private isAuthenticated = false;
  private subscription: Subscription | undefined;
  private getState: Observable<any>;

  constructor(private store: Store<AppState>, private cdRef: ChangeDetectorRef,
              private viewportScroller: ViewportScroller, private translate: TranslateService, private router: Router,
              private formBuilder: FormBuilder, private snackBar: MatSnackBar) {
    this.getState = this.store.select(selectMainState);
    this.store.select(selectAuthState).subscribe((state: any) => {
      this.isAuthenticated = state.isAuthenticated;
      if (state.isAuthenticated) {
        const user: IUserAll = state.user;
        this.email.setValue(user.email);
        this.name.setValue(getUserName(user));
      }
    });
    this.minDate = getNow();
    this.maxDate = plusMonthDate(this.minDate, MAX_RESERVATION_MONTH, this.minDate.getDate() + 1);
  }

  get book(): void {
    const data = {date: this.date.value, product: this.product.value};
    this.router.navigate(['me', 'reservation'], {state: data});
    return;
  }

  get sendEmail(): void {
    if (this.form.invalid) {
      return;
    }
    return this.store.dispatch(
      new fromActionsMain.SendMessage(this.form.value)
    );
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
    this.subscribe();
    this.getCatalogues();
    this.getProducts();

    this.filteredGroup = this.group.valueChanges.pipe(startWith(''), map(value => {
      if (typeof value === 'string') {
        return value;
      }
      this.products = value.products;
      this.product.setValue('');
      return value.name;
    }), map(name => name ? this.filterGroup(name) : this.groups ? this.groups.slice() : this.groups));
    this.filteredProduct = this.product.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterProduct(name) : this.products ? this.products.slice() : this.products)
    );
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onNavigation(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
  }

  myFilter = (d: Date | null): boolean => filterDateRoom(d);

  displayFnGroup(group: IProductGroup): string {
    return group ? `${group.name}` : '';
  }

  displayFnProduct(product: IProduct): string {
    return product ? `${product.name}` : '';
  }

  keyDownHandler(event: any, form: FormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  keyDownGroup(event: any): void {
    this.products = undefined;
    this.keyDownHandler(event, this.product);
    this.keyDownHandler(event, this.group);
  }

  setGroup(group: IProductGroup): void {
    this.group.setValue(group);
  }

  setProduct(product: IProduct): void {
    this.product.setValue(product);
    this.viewportScroller.scrollToAnchor('book');
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      email: this.email,
      subject: this.subject,
      body: this.body
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.groups) {
        this.groups = state.groups;
      }
      if (state.catalogue && Array.from(state.catalogue)) {
        state.catalogue.forEach((value: ICatalogue) => {
          if (value && value.blob) {
            const slide = new Slide(`data:image/jpg;base64,${value.blob}`);
            this.slides = [...this.slides, slide];
          }
        });
      }
      if (state.errorMessage || state.message) {
        this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsMain.Clean()
    );
  }

  private getCatalogues(): void {
    this.store.dispatch(
      new fromActionsMain.GetAllCatalogue()
    );
  }

  private getProducts(): void {
    this.store.dispatch(
      new fromActionsMain.GetAllProducts()
    );
  }

  private filterGroup(name: string): IProductGroup[] | undefined {
    const filterValue = name.toLowerCase();

    return this.groups?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterProduct(name: string): IProduct[] | undefined {
    const filterValue = name.toLowerCase();

    return this.products?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }
}
