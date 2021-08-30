import { Component, Input, OnInit } from '@angular/core';
import { IProduct } from '../../interfaces/product';
import { formatDuration } from '../../util/dates';
import { detailExpandAnimation } from '../../util/animation';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(private translate: TranslateService) {
    this.expand = false;
  }

  ngOnInit(): void {
    if (this.card && this.card.duration) {
      this.time = formatDuration(this.card.duration, this.translate.currentLang);
    }
  }

  click($event: MouseEvent): void {
    this.expand = !this.expand;
    $event.stopPropagation();
  }
}
