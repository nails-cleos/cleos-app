import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainContentService } from '../main-content.service';
import { TranslateService } from '@ngx-translate/core';
import { IMainTreatment, ISection, sections } from '../../util/MainTreatment';
import { SharedModule } from "../../shared/shared.module";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: 'app-treatment',
  standalone: true,
  imports: [SharedModule, NgOptimizedImage],
  templateUrl: './treatment.component.html',
  styleUrl: './treatment.component.scss'
})
export class TreatmentComponent implements OnInit {
  sections?: ISection[];

  constructor(private route: ActivatedRoute, private mainContent: MainContentService,
              private translate: TranslateService) {
    this.mainContent.configure(false, 'open');
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const translations = this.translate.instant('TREATMENTS')
        .find((it: IMainTreatment) => it.id === params.id).translations;
      if (translations) {
        this.sections = sections(translations);
      }
    });
  }
}
