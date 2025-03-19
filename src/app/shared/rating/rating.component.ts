import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { SharedModule } from "../shared.module";

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class RatingComponent implements OnInit {

  @Input() rating: number;
  @Input() rate: string;
  @Input() hover: number;
  @Input() starCount: number;
  @Input() detail?: string;
  @Input() color: ThemePalette;
  @Input() canEdit: boolean;
  @Output() ratingUpdated = new EventEmitter<number>();
  @Output() ratingHover = new EventEmitter<number>();

  ratingArr: Array<number> = [];

  constructor() {
    this.rating = -1;
    this.hover = -1;
    this.starCount = 5;
    this.color = 'accent';
    this.rate = 'REVIEW.YOUR_RATE';
    this.canEdit = false;
  }

  ngOnInit(): void {
    for (let index = 1; index <= this.starCount; index++) {
      this.ratingArr.push(index);
    }
  }

  onClick = (rating: number): void => {
    this.rating = this.rating === rating ? -1 : rating;
    this.ratingUpdated.emit(this.rating);
  }

  onHover = (hover: number): void => {
    this.hover = hover;
    this.ratingHover.emit(this.hover);
  }

  fontSet = (
    i: number
  ): 'material-icons' | 'material-symbols-outlined' => this.hover >= i + 1 || this.rating >= i + 1 ? 'material-icons' :
    'material-symbols-outlined';

  setColor = (i: number): ThemePalette => this.hover >= i + 1 || this.rating >= i + 1 ? this.color : undefined;
}
