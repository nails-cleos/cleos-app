import { Component, Input, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-mini-card',
  templateUrl: './mini-card.component.html',
  styleUrls: ['./mini-card.component.css']
})
export class MiniCardComponent implements OnInit {
  @Input() icon: string | undefined;
  @Input() title!: string;
  @Input() value: number | undefined;
  @Input() color: ThemePalette | undefined;
  @Input() isIncrease: boolean | undefined;
  @Input() isCurrency: boolean | undefined;
  @Input() duration!: string;
  @Input() percentValue: number | undefined;

  constructor() {
  }

  ngOnInit(): void {
  }

}
