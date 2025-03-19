import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SharedModule } from '../../shared/shared.module';
import { BackButtonDirective } from "../../directives/back-button.directive";

export interface ISorted {
  order: number;
  key: string;
}

export class Sorted implements ISorted {
  order: number;
  key: string;

  constructor(order: number, key: string) {
    this.order = order;
    this.key = key;
  }
}

export interface ISorting {
  key: string;
  name: string;
  order?: number;
}

export class ItemSorting implements ISorting {
  key: string;
  name: string;
  order?: number;

  constructor(key: string, name: string, order?: number) {
    this.key = key;
    this.name = name;
    this.order = order;
  }
}

@Component({
  selector: 'app-drag-drop-sorting',
  templateUrl: './drag-drop-sorting.component.html',
  styleUrls: ['./drag-drop-sorting.component.scss'],
  standalone: true,
  imports: [SharedModule, BackButtonDirective],
})
export class DragDropSortingComponent {
  @Input() title!: string;
  @Input() items!: ISorting[];
  @Output() sorted = new EventEmitter<Sorted[]>();

  get sort(): void {
    const sorted = this.items.map((item, i) => new Sorted(i + 1, item.key));
    return this.sorted.emit(sorted);
  }

  drop = (event: CdkDragDrop<ISorting[]>): void => moveItemInArray(this.items, event.previousIndex, event.currentIndex);
}
