import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit {

  @Input() rating: number;
  @Input() rate: string;
  @Input() hover: number;
  @Input() starCount: number;
  @Input() detail: string | undefined;
  @Input() color: ThemePalette;
  @Input() notEmpty: boolean;
  @Output() ratingUpdated = new EventEmitter();
  @Output() ratingHover = new EventEmitter();

  ratingArr: Array<number> = [];
  background: string | undefined;

  constructor() {
    this.rating = -1;
    this.hover = -1;
    this.starCount = 5;
    this.color = 'accent';
    this.rate = 'REVIEW.YOUR_RATE';
    this.notEmpty = false;
  }

  ngOnInit(): void {
    this.background = `var(--${this.color}-color)`;
    for (let index = 1; index <= this.starCount; index++) {
      if (!(this.notEmpty && Math.ceil(this.rating) < index)) {
        this.ratingArr.push(index);
      }
    }
  }

  onClick(rating: number): void {
    this.ratingUpdated.emit(rating);
    return;
  }

  onHover(hover: number): void {
    this.ratingHover.emit(hover);
    return;
  }

  showIcon(index: number): string {
    if (this.hover > 0) {
      return this.hover >= index ? 'star' : 'star_border';
    }

    const varColor = `var(--${this.color}-color)`;
    const percentage = this.rating % 1;
    this.background = percentage !== 0 && Math.floor(this.rating) === index ?
      `linear-gradient(to right, ${varColor} ${percentage * 100}%, var(--accent-color) 0%)` : varColor;

    return Math.ceil(this.rating) >= index ? 'star' : 'star_border';
  }
}
