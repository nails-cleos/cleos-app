import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MainContentService } from '../main-content.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  imports: [SharedModule],
})
export class PrivacyComponent {
  url = environment.appServer;

  constructor(private mainContent: MainContentService) {
    this.mainContent.configure(false, 'open');
  }
}
