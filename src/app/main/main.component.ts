import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, Subscription } from 'rxjs';
import { ICatalogue, ISlide, Slide } from '../interfaces/catalogue';
import { AppState, selectAuthState, selectMainState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsMain from '../store/main.actions';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { IProduct } from '../interfaces/product';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { requireMatch } from '../util/validators';
import { getNow, plusMonthDate } from '../util/dates';
import { MAX_RESERVATION_MONTH } from '../interfaces/reservation';
import { ViewportScroller } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { IUserAll } from '../interfaces/user';
import { getUserName } from '../util/helper';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  title = environment.title;
  isHandset: any;
  products: IProduct[] | undefined;
  isAuthenticated = false;

  cardLayout = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(({matches}) => {
        this.isHandset = matches;
        if (matches) {
          return {columns: 1};
        }
        return {columns: 4};
      }),
      shareReplay()
    );

  subscription: Subscription | undefined;
  getState: Observable<any>;

  slides: ISlide[] = [];

  maxDate: Date;
  minDate: Date;
  date: FormControl = new FormControl();

  filteredProduct: Observable<IProduct[] | undefined> | undefined;
  product: FormControl = new FormControl('', [requireMatch]);

  form!: FormGroup;
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

  constructor(private breakpointObserver: BreakpointObserver, private store: Store<AppState>,
              private cdRef: ChangeDetectorRef, private viewportScroller: ViewportScroller,
              private translate: TranslateService, private router: Router, private formBuilder: FormBuilder,
              private snackBar: MatSnackBar) {
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

  ngOnInit(): void {
    this.clean();
    this.createForm();
    this.subscribe();
    this.getCatalogues();
    this.getProducts();

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

  myFilter = (d: Date | null): boolean => {
    const now = getNow();
    const date = (d || now);
    return date > now;
  };

  displayFnProduct(product: IProduct): string {
    return product ? `${product.name}` : '';
  }

  keyDownHandler(event: any, form: FormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  book(): void {
    const data = {date: this.date.value, product: this.product.value};
    this.router.navigate(['me', 'reservation'], {state: data});
  }

  setProduct(product: IProduct): void {
    this.product.setValue(product);
  }

  sendEmail(): void {
    if (this.form.invalid) {
      return;
    }
    this.store.dispatch(
      new fromActionsMain.SendMessage(this.form.value)
    );
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
      if (state.products) {
        this.products = state.products;
      }
      console.log(state)
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

  private filterProduct(name: string): IProduct[] | undefined {
    const filterValue = name.toLowerCase();

    return this.products?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }
}
