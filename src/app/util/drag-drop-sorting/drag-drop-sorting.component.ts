import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SharedModule } from '../../shared/shared.module';
import { BackButtonDirective } from '../../directives/back-button.directive';

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
  imports: [SharedModule, BackButtonDirective],
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
