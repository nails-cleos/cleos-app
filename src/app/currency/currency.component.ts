import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ɵTypedOrUntyped
} from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectCurrencyState } from '../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import { Currency, ICurrency } from '../interfaces/currency';
import * as fromActionsCurrency from '../store/currency.actions';
import { TranslateService } from '@ngx-translate/core';
import { fieldChange } from '../util/validators';
import { SharedModule } from "../shared/shared.module";
import { BackButtonDirective } from "../directives/back-button.directive";

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
  standalone: true,
  imports: [SharedModule, BackButtonDirective]
})
export class CurrencyComponent implements OnInit, OnDestroy {
  @Input() currency?: ICurrency;

  id?: string;
  isAddMode: boolean;
  form!: UntypedFormGroup;

  errors: any = [];
  icons = ['attach_money', 'euro', 'currency_pound'];

  private getState: Observable<any>;
  private subscription: Subscription | undefined;
  private readonly language: string;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>,
              private formBuilder: UntypedFormBuilder, private router: Router, private route: ActivatedRoute,
              private cdRef: ChangeDetectorRef) {
    this.isAddMode = true;
    this.getState = this.store.select(selectCurrencyState);
    this.language = this.translate.currentLang;
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const currency: ICurrency = new Currency();
    currency.code = fieldChange(this.getForm.code as UntypedFormControl, this.currency?.code);
    currency.name = fieldChange(this.getForm.name as UntypedFormControl, this.currency?.name);
    currency.icon = fieldChange(this.getForm.icon as UntypedFormControl, this.currency?.icon);

    if (this.isAddMode) {
      return this.store.dispatch(
        new fromActionsCurrency.CurrencySave(currency)
      );
    } else {
      currency.id = this.id;
      this.currency = undefined;
      return this.store.dispatch(new fromActionsCurrency.CurrencyUpdate(currency));
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
    }
    this.clean();
    this.createForm();
    this.subscribe();
    this.isAddMode = !this.id;
    if (!this.isAddMode) {
      this.getCurrency();
    }
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private createForm = (): void => {
    this.form = this.formBuilder.group({
      name: [''],
      code: ['', [Validators.required]],
      icon: ['']
    });
  }

  private clean = (): void => this.store.dispatch(new fromActionsCurrency.Clean());

  private getCurrency = (): void => {
    if (!this.currency) {
      this.store.dispatch(
        new fromActionsCurrency.CurrencyFind(this.id)
      );
    }
  }

  private subscribe = (): void => {
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
}
