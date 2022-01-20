import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { IProduct, IProductGroup } from '../../interfaces/product';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectProductState } from '../../store/app.states';
import * as fromActionsProduct from '../../store/product.actions';
import { API_LOCALE, formatDuration } from '../../util/dates';
import { groupDurability } from '../../util/helper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-view',
  templateUrl: './product-view.component.html',
  styleUrls: ['./product-view.component.scss']
})
export class ProductViewComponent implements OnInit, AfterViewInit, OnDestroy {
  group?: IProductGroup;

  private subscription?: Subscription;
  private getState: Observable<any>;
  private productId?: string;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private translate: TranslateService) {
    this.getState = this.store.select(selectProductState);
  }

  ngOnInit(): void {
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getProduct();
  }

  edit(): void {
    this.store.dispatch(
      new fromActionsProduct.ProductSelected({product: this.group, path: 'edit'})
    );
  }

  getHistory(productId?: string): void {
    this.productId = productId;
    this.store.dispatch(
      new fromActionsProduct.ProductHistory({id: this.group?.id, productId})
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        const products = [...state.selected.products?.map((p: IProduct) => {
          if (p.duration) {
            const duration = formatDuration(p.duration, API_LOCALE);

            return Object.assign({}, p, {duration, history: [], showHistory: false});
          }
          return p;
        })];
        this.group = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description,
          durability: groupDurability(state.selected, this.translate),
          durabilityMin: state.selected.durabilityMin,
          durabilityMax: state.selected.durabilityMax,
          products
        } as IProductGroup;
      }
      if (state.history) {
        const product = this.group?.products?.find(p => p.id === this.productId);
        if (product) {
          product.showHistory = true;
          product.history = state.history;
        }
      }
    });
  }

  private getProduct(): void {
    if (!this.group) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsProduct.ProductFind({id, path: 'view'})
      );
    }
  }
}

