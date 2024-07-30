import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainContentService } from '../main-content.service';
import { TranslateService } from '@ngx-translate/core';
import { JsonPipe, NgClass, NgOptimizedImage, NgStyle } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatList } from '@angular/material/list';
import { IMainTreatment, ISection, sections } from '../../util/MainTreatment';

@Component({
  selector: 'app-treatment',
  standalone: true,
  imports: [
    JsonPipe,
    NgStyle,
    NgOptimizedImage,
    MatDivider,
    MatList,
    NgClass
  ],
  templateUrl: './treatment.component.html',
  styleUrl: './treatment.component.scss'
})
export class TreatmentComponent implements OnInit {
  sections?: ISection[];

  constructor(private route: ActivatedRoute, private mainContent: MainContentService, private translate: TranslateService) {
    this.mainContent.configure(false, 'open');
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadTreatment(params.id)
      this.translate.onLangChange.subscribe(() => this.loadTreatment(params.id));
    });
  }

  private loadTreatment(id: string) {
    const translations = this.translate.instant('TREATMENTS').find((it: IMainTreatment) => it.id === id).translations;
    if (translations) {
      this.sections = sections(translations);
    }
  }
}
