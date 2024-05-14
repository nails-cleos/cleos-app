import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Currency, ICurrency } from '../../interfaces/currency';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectCurrencyState } from '../../store/app.states';
import { MatDialog } from '@angular/material/dialog';
import { fieldChange } from '../../util/validators';
import * as fromActionsCurrency from '../../store/currency.actions';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-currency-detail',
  templateUrl: './currency-detail.component.html',
  styleUrls: ['./currency-detail.component.scss']
})
export class CurrencyDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() currency?: ICurrency;

  form!: UntypedFormGroup;

  code: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  name: UntypedFormControl = new UntypedFormControl('');
  icon: UntypedFormControl = new UntypedFormControl('');

  errors: any = [];
  icons = ['attach_money', 'euro', 'currency_pound'];

  private subscription?: Subscription;
  private getState: Observable<any>;
  private readonly language: string;

  constructor(private readonly translate: TranslateService, private route: ActivatedRoute, private store: Store<AppState>,
              private formBuilder: UntypedFormBuilder, private router: Router, public dialog: MatDialog) {
    this.getState = this.store.select(selectCurrencyState);
    this.language = this.translate.currentLang;
  }

  get update(): void {
    if (this.form.invalid) {
      return;
    }
    const currency: ICurrency = new Currency();
    currency.id = this.currency?.id;

    currency.code = fieldChange(this.code, this.currency?.code);
    currency.name = fieldChange(this.name, this.currency?.name);
    currency.icon = fieldChange(this.icon, this.currency?.icon);

    return this.store.dispatch(new fromActionsCurrency.CurrencyUpdate(currency));
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
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate([this.language, 'currency']);
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
