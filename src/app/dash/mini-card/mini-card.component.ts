import { Component, Input, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-mini-card',
  templateUrl: './mini-card.component.html',
  styleUrls: ['./mini-card.component.css']
})
export class MiniCardComponent implements OnInit {
  @Input() icon?: string;
  @Input() title!: string;
  @Input() value?: number;
  @Input() color?: ThemePalette;
  @Input() isIncrease?: boolean;
  @Input() isCurrency?: boolean;
  @Input() duration?: string;
  @Input() percentValue?: number;
  @Input() error: any;

  locale: string;

  constructor(private translate: TranslateService) {
    this.locale = this.translate.currentLang;
  }

  ngOnInit(): void {
  }
}
