import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectTreatmentState } from '../../store/app.states';
import * as fromActionsTreatment from '../../store/treatment.actions';
import { IColorAll } from '../../interfaces/color';
import { SharedModule } from "../../shared/shared.module";
import { DurationTimePipe } from "../../pipes/durationTime.pipe";
import { TreatmentTableComponent } from "../table/treatment-table.component";
import { BackButtonDirective } from "../../directives/back-button.directive";

@Component({
  selector: 'app-treatment-view',
  templateUrl: './treatment-view.component.html',
  styleUrls: ['./treatment-view.component.scss'],
  standalone: true,
  imports: [SharedModule, DurationTimePipe, TreatmentTableComponent, BackButtonDirective],
})
export class TreatmentViewComponent implements OnInit, AfterViewInit, OnDestroy {
  group?: ITreatmentGroup;
  colors?: IColorAll[];

  private subscription?: Subscription;
  private getState: Observable<any>;
  private treatmentId?: string;

  constructor(private route: ActivatedRoute, private store: Store<AppState>) {
    this.getState = this.store.select(selectTreatmentState);
  }

  get edit(): void {
    return this.store.dispatch(
      new fromActionsTreatment.TreatmentSelected({ treatment: this.group, path: 'edit' })
    );
  }

  ngOnInit(): void {
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getTreatment();
  }

  getHistory = (treatmentId?: string): void => {
    this.treatmentId = treatmentId;
    this.store.dispatch(
      new fromActionsTreatment.TreatmentHistory({ id: this.group?.id, treatmentId })
    );
  }

  private getTreatment = (): void => {
    if (!this.group) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsTreatment.TreatmentFind({ id, path: 'view' })
      );
    }
  }

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        const treatments = [...state.selected.treatments];
        this.group = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description,
          priceFrom: state.priceFrom,
          colors: state.selected.colors,
          treatments
        } as ITreatmentGroup;
        this.colors = state.selected.colors;
      }
      if (state.history && this.group) {
        this.group.treatments = this.group.treatments?.map(p => {
          if (p.id === this.treatmentId) {
            return Object.assign({ showHistory: true, history: state.history }, p);
          }
          return p;
        });
        const treatment = this.group.treatments?.find(p => p.id === this.treatmentId);
        if (treatment) {
          treatment.history = state.history;
        }
      }
    });
  }
}

