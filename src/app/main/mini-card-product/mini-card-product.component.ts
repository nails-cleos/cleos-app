import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IProduct, IProductGroup } from '../../interfaces/product';
import { detailExpandAnimation } from '../../util/animation';
import { TranslateService } from '@ngx-translate/core';
import { getProductDurability } from '../../util/helper';

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
  durability: string | undefined;

  constructor(private translate: TranslateService) {
    this.expand = true;
  }

  get setGroup(): void {
    return this.groupEvent.emit(this.card);
  }

  ngOnInit(): void {
    if (this.card) {
      if (this.card.durabilityMin && this.card.durabilityMax) {
        this.durability = getProductDurability(this.card.durabilityMin, this.card.durabilityMax, this.translate);
      }
      this.products = this.card.products;
    }
  }

  click($event: MouseEvent): void {
    this.expand = !this.expand;
    $event.stopPropagation();
  }

  setProduct(product: IProduct): void {
    this.groupEvent.emit(this.card);
    this.productEvent.emit(product);
  }
}
