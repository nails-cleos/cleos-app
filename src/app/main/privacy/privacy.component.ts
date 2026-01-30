import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MainContentService } from '../../services/main-content.service';
import { EnvService } from '../../services/env.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyComponent {
  private readonly mainContent: MainContentService = inject(MainContentService);
  private readonly env: EnvService = inject(EnvService);

  url = this.env.appServer;
  title = this.env.title;
  appDomain = this.env.appDomain;

  constructor() {
    this.mainContent.configure(false, 'open');
  }
}
