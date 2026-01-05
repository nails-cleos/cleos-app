import { ChangeDetectionStrategy, Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MainContentService } from '../../services/main-content.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyComponent {
  url = environment.appServer;

  constructor(private mainContent: MainContentService) {
    this.mainContent.configure(false, 'open');
  }
}
