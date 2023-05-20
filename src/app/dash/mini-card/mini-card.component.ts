import { Component, Input, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-mini-card',
  templateUrl: './mini-card.component.html',
  styleUrls: ['./mini-card.component.scss']
})
export class MiniCardComponent implements OnInit {
  @Input() icon?: string;
  @Input() title!: string;
  @Input() value?: number | string;
  @Input() color?: ThemePalette;
  @Input() isIncrease?: boolean;
  @Input() isInfinity?: boolean;
  @Input() isCurrency?: boolean;
  @Input() duration?: string;
  @Input() percentValue?: number;
  @Input() period?: string;
  @Input() previousPeriod?: string;
  @Input() isProjection?: boolean;
  @Input() projection?: string;
  @Input() error: any;
  @Input() isLoading: any | boolean;

  locale: string;

  constructor(private translate: TranslateService) {
    this.locale = this.translate.currentLang;
  }

  ngOnInit(): void {
  }
}
