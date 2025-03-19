import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  DragDropSortingComponent,
  ISorted,
  ISorting,
  ItemSorting
} from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectTreatmentState } from '../../store/app.states';
import * as fromActionsTreatment from '../../store/treatment.actions';
import { ITreatmentGroupAll } from '../../interfaces/treatment';
import { SharedModule } from "../../shared/shared.module";

@Component({
  selector: 'app-treatment-group-sorting',
  templateUrl: './treatment-sorting.component.html',
  styleUrls: ['./treatment-group-sorting.component.scss'],
  standalone: true,
  imports: [SharedModule, DragDropSortingComponent],
})
export class TreatmentGroupSortingComponent implements OnInit, OnDestroy {

  items?: ISorting[];

  private subscription?: Subscription;
  private getState: Observable<any>;

  constructor(private store: Store<AppState>) {
    this.getState = this.store.select(selectTreatmentState);
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.getTreatments();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  sorted = (sorted: ISorted[]): void => this.store.dispatch(new fromActionsTreatment.TreatmentGroupUpdateSort(sorted));

  private clean = (): void => this.store.dispatch(new fromActionsTreatment.Clean());

  private getTreatments = (): void => this.store.dispatch(new fromActionsTreatment.GetAllGroup());

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((stateValue) => {
      if (stateValue.message) {
        this.clean();
        this.getTreatments();
      }
      this.items = stateValue?.data?.map((group: ITreatmentGroupAll) => new ItemSorting(
        group.id, group.name, group.order)
      );
    });
  }
}
