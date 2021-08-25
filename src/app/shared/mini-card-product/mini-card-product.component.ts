import { Component, Input, OnInit } from '@angular/core';
import { IProduct } from '../../interfaces/product';
import { convertDuration, createDate, getTime } from '../../util/dates';
import { detailExpandAnimation } from '../../util/animation';

@Component({
  selector: 'app-mini-card-product',
  templateUrl: './mini-card-product.component.html',
  animations: [detailExpandAnimation],
  styleUrls: ['./mini-card-product.component.scss']
})
export class MiniCardProductComponent implements OnInit {
  @Input() card!: IProduct;
  time: string | undefined;
  expand: boolean;

  constructor() {
    this.expand = false;
  }

  ngOnInit(): void {
    if (this.card && this.card.duration) {
      const duration = convertDuration(this.card.duration);
      this.time = getTime(createDate(duration.hour, duration.minute));
    }
  }

  click($event: MouseEvent): void {
    this.expand = !this.expand;
    $event.stopPropagation();
  }
}
