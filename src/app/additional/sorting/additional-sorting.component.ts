import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  DragDropSortingComponent,
  ISorted,
  ISorting,
  ItemSorting,
} from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAdditionalState } from '../../store/app.states';
import { IAdditionalAll } from '../../interfaces/additional';
import { SharedModule } from '../../shared/shared.module';
import { clean, getAdditionalList, sortAdditional } from '../../store/additional.actions';

@Component({
  selector: 'app-sorting',
  templateUrl: './additional-sorting.component.html',
  styleUrls: ['./additional-sorting.component.scss'],
  imports: [SharedModule, DragDropSortingComponent],
})
export class AdditionalSortingComponent implements OnInit, OnDestroy {

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

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  sorted = (additionalList: ISorted[]): void => this.store.dispatch(sortAdditional({ additionalList }));

  private clean = (): void => this.store.dispatch(clean());

  private getAdditionalList = (): void => this.store.dispatch(getAdditionalList());

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      if (state.response) {
        this.clean();
        this.getAdditionalList();
      }
      this.items = state?.data?.map((iAdditionalAll: IAdditionalAll) => new ItemSorting(
        iAdditionalAll.id, iAdditionalAll.name, iAdditionalAll.order),
      );
    });
  };
}
