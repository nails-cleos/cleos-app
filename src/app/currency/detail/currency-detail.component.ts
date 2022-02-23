import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Currency, ICurrency } from '../../interfaces/currency';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectCurrencyState } from '../../store/app.states';
import { MatDialog } from '@angular/material/dialog';
import { fieldChange } from '../../util/validators';
import * as fromActionsCurrency from '../../store/currency.actions';

@Component({
  selector: 'app-currency-detail',
  templateUrl: './currency-detail.component.html',
  styleUrls: ['./currency-detail.component.scss']
})
export class CurrencyDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() currency: ICurrency | undefined;

  form!: FormGroup;

  code: FormControl = new FormControl('', [
    Validators.required
  ]);
  name: FormControl = new FormControl('');
  icon: FormControl = new FormControl('');

  errors: any = [];
  icons = ['attach_money', 'euro', 'currency_pound'];

  private subscription: Subscription | undefined;
  private getState: Observable<any>;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: FormBuilder,
              private router: Router, public dialog: MatDialog) {
    this.getState = this.store.select(selectCurrencyState);
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getCurrency();
  }

  update(): void {
    if (this.form.invalid) {
      return;
    }
    const currency: ICurrency = new Currency();
    currency.id = this.currency?.id;

    currency.code = fieldChange(this.code, this.currency?.code);
    currency.name = fieldChange(this.name, this.currency?.name);
    currency.icon = fieldChange(this.icon, this.currency?.icon);

    this.store.dispatch(new fromActionsCurrency.CurrencyUpdate(currency));
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      code: this.code,
      name: this.name,
      icon: this.icon
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.currency = {
          id: state.selected.id,
          name: state.selected.name,
          icon: state.selected.icon,
          code: state.selected.code
        } as ICurrency;
        this.form.patchValue(this.currency);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.message) {
        this.router.navigate(['currency']);
      }
    });
  }

  private getCurrency(): void {
    if (!this.currency) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsCurrency.CurrencyFind(id)
      );
    }
  }
}
