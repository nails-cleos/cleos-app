import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { BackButtonDirective } from '@app/directives/back-button.directive';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

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
  imports: [MatIcon, MatButton, TranslatePipe, BackButtonDirective, BackButtonDirective,
    CdkDropList, CdkDrag, CdkDragPlaceholder, CdkDragHandle],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DragDropSortingComponent {
  title = input.required<string>();
  items = input.required<ISorting[]>();
  sorted = output<Sorted[]>();

  sort() {
    const sorted = this.items().map((item, i) => new Sorted(i + 1, item.key));
    this.sorted.emit(sorted);
  }

  drop = (event: CdkDragDrop<ISorting[]>) => moveItemInArray(this.items(), event.previousIndex, event.currentIndex);
}
