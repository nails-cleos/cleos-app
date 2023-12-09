import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MainContentService } from '../main-content.service';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent {
  url = `${environment.appServer}/main`;

  constructor(private mainContent: MainContentService) {
    this.mainContent.showPreload(false);
  }
}
