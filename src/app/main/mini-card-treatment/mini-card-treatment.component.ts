import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ITreatment, ITreatmentGroup } from '../../interfaces/treatment';
import { detailExpandAnimation } from '../../util/animation';
import { TranslateService } from '@ngx-translate/core';
import { getTreatmentDurability } from '../../util/helper';

@Component({
  selector: 'app-mini-card-treatment-group',
  templateUrl: './mini-card-treatment.component.html',
  animations: [detailExpandAnimation],
  styleUrls: ['./mini-card-treatment.component.scss']
})
export class MiniCardTreatmentComponent implements OnInit {
  @Output() groupEvent = new EventEmitter<ITreatmentGroup>();
  @Output() treatmentEvent = new EventEmitter<ITreatment>();

  @Input() card!: ITreatmentGroup;
  time: string | undefined;
  expand: boolean;
  treatments: ITreatment[] | undefined;
  durability: string | undefined;

  constructor(private translate: TranslateService) {
    this.expand = true;
  }

  get setGroup(): void {
    return this.groupEvent.emit(this.card);
  }

  ngOnInit(): void {
    if (this.card) {
      if (this.card.durabilityMin && this.card.durabilityMax) {
        this.durability = getTreatmentDurability(this.card.durabilityMin, this.card.durabilityMax, this.translate);
      }
      this.treatments = this.card.treatments;
    }
  }

  click($event: MouseEvent): void {
    this.expand = !this.expand;
    $event.stopPropagation();
  }

  setTreatment(treatment: ITreatment): void {
    this.groupEvent.emit(this.card);
    this.treatmentEvent.emit(treatment);
  }
}
