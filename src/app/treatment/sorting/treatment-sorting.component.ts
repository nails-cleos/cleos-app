import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectTreatmentState } from '../../store/app.states';
import { TranslateService } from '@ngx-translate/core';
import { ITreatmentAll } from '../../interfaces/treatment';
import { clean, getTreatmentGroup, sortTreatment } from '../../store/treatment.actions';
import {
  DragDropSortingComponent,
  ISorted,
  ItemSorting,
} from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-treatment-sorting',
  templateUrl: './treatment-sorting.component.html',
  styleUrls: ['./treatment-sorting.component.scss'],
  imports: [SharedModule, DragDropSortingComponent],
})
export class TreatmentSortingComponent implements OnInit, OnDestroy {

  items?: ITreatmentAll[];

  private subscription?: Subscription;
  private getState: Observable<any>;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private translate: TranslateService) {
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

  sorted = (treatments: ISorted[]): void => {
    this.items = undefined;
    this.store.dispatch(sortTreatment({ treatments }));
  };

  private clean = (): void => this.store.dispatch(clean());

  private getTreatments = (): void => {
    if (!this.items) {
      const id = this.route.snapshot.paramMap.get('id')!;
      this.store.dispatch(getTreatmentGroup({ id, path: 'sorting' }));
    }
  };

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      if (state.response) {
        this.clean();
        this.getTreatments();
      }
      this.items =
        state.selected?.treatments?.map((group: ITreatmentAll) => new ItemSorting(group.id, group.name, group.order));
    });
  };
}
