import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OfficeComponent } from './office.component';

@Component({
  selector: 'app-office-create-page',
  template: '<app-office />',
  imports: [OfficeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeCreatePageComponent {}
