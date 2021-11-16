import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IProduct, IProductGroup } from '../../interfaces/product';
import { detailExpandAnimation } from '../../util/animation';
import { TranslateService } from '@ngx-translate/core';
import { formatDuration } from '../../util/dates';

@Component({
  selector: 'app-mini-card-product-group',
  templateUrl: './mini-card-product.component.html',
  animations: [detailExpandAnimation],
  styleUrls: ['./mini-card-product.component.scss']
})
export class MiniCardProductComponent implements OnInit {
  @Output() groupEvent = new EventEmitter<IProductGroup>();
  @Output() productEvent = new EventEmitter<IProduct>();

  @Input() card!: IProductGroup;
  time: string | undefined;
  expand: boolean;
  products: IProduct[] | undefined;

  constructor(private translate: TranslateService) {
    this.expand = true;
  }

  ngOnInit(): void {
    if (this.card) {
      this.products = this.card.products?.map(product => {
        if (product.duration) {
          const duration = formatDuration(product.duration, this.translate.currentLang);

          return Object.assign({}, product, {duration});
        }
        return product;
      });
    }
  }

  click($event: MouseEvent): void {
    this.expand = !this.expand;
    $event.stopPropagation();
  }

  setGroup(): void {
    this.groupEvent.emit(this.card);
  }

  setProduct(product: IProduct): void {
    this.groupEvent.emit(this.card);
    this.productEvent.emit(product);
  }
}
