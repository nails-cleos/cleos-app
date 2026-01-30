import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';
import { IError } from '../../interfaces/common';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  imports: [AppMaterialModule, BackButtonDirective, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent {
  error = input<IError>();
  isCard = input<boolean>(false);

  imageSrc: string | undefined;
  retry = false;

  constructor() {
    effect(() => {
      const error = this.error();
      if (!error) {
        return;
      }
      if (!['NO_CONTENT', 'no_content_error'].includes(error.status || '')) {
        if (error.status === 'NOT_FOUND') {
          this.imageSrc = './assets/not_found.png';
          this.retry = false;
        } else {
          this.imageSrc = './assets/error.png';
          this.retry = error.status !== 'BAD_REQUEST';
        }
      }
    });
  }

  reload() {
    window.location.reload();
  }
}
