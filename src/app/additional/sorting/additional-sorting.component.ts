import { Component, OnInit } from '@angular/core';
import { ISorted, ISorting, ItemSorting } from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAdditionalState } from '../../store/app.states';
import * as fromActionsAdditional from '../../store/additional.actions';
import { IAdditionalAll } from '../../interfaces/additional';

@Component({
  selector: 'app-sorting',
  templateUrl: './additional-sorting.component.html',
  styleUrls: ['./additional-sorting.component.scss']
})
export class AdditionalSortingComponent implements OnInit {

  items?: ISorting[];

  private subscription?: Subscription;
  private getState: Observable<any>;

  constructor(private store: Store<AppState>) {
    this.getState = this.store.select(selectAdditionalState);
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.getAdditionalList();
  }

  sorted(sorted: ISorted[]): void {
    this.store.dispatch(
      new fromActionsAdditional.AdditionalUpdateSort(sorted)
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((stateValue) => {
      if (stateValue.message) {
        this.clean();
        this.getAdditionalList();
      }
      this.items = stateValue.data?.map((iAdditionalAll: IAdditionalAll) => new ItemSorting(iAdditionalAll.id, iAdditionalAll.name,
        iAdditionalAll.order));
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsAdditional.Clean()
    );
  }

  private getAdditionalList(): void {
    this.store.dispatch(
      new fromActionsAdditional.GetAdditionalList()
    );
  }
}
