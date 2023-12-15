import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MainContentService } from '../main-content.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent {
  url = `${environment.appServer}/main`;

  constructor(private mainContent: MainContentService) {
    this.mainContent.configure(false, 'open');
  }
}
