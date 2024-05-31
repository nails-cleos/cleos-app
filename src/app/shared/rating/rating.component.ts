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
  @Input() detail?: string;
  @Input() color: ThemePalette;
  @Input() notEmpty: boolean;
  @Input() canEdit: boolean;
  @Output() ratingUpdated = new EventEmitter<number>();
  @Output() ratingHover = new EventEmitter<number>();

  ratingArr: Array<number> = [];
  background: string | undefined;

  constructor() {
    this.rating = -1;
    this.hover = -1;
    this.starCount = 5;
    this.color = 'accent';
    this.rate = 'REVIEW.YOUR_RATE';
    this.notEmpty = false;
    this.canEdit = false
  }

  ngOnInit(): void {
    this.background = `var(--${ this.color }-color)`;
    for (let index = 1; index <= this.starCount; index++) {
      if (!(this.notEmpty && Math.ceil(this.rating) < index)) {
        this.ratingArr.push(index);
      }
    }
  }

  onClick(rating: number): void {
    this.rating = this.rating === rating ? -1 : rating;
    this.ratingUpdated.emit(this.rating);
  }

  onHover(hover: number): void {
    this.hover = hover;
    this.ratingHover.emit(this.hover);
  }
}
