import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';
import { BackButtonDirective } from '@app/directives/back-button.directive';
import { TranslatePipe } from '@ngx-translate/core';
import { IError } from '@app/interfaces/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  imports: [MatIcon, MatButton, TranslatePipe, BackButtonDirective, MatCard, MatCardContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent {
  error = input<IError>();
  isCard = input<boolean>(false);

  imageSrc: string | undefined;
  retry = false;
  readonly titleKey = computed(() => {
    switch (this.error()?.status) {
      case 'NOT_FOUND':
        return 'COMMON.ERROR.PAGE.NOT_FOUND.TITLE';
      case 'BAD_REQUEST':
        return 'COMMON.ERROR.PAGE.BAD_REQUEST.TITLE';
      case 'SERVER_ERROR':
        return 'COMMON.ERROR.PAGE.SERVER_ERROR.TITLE';
      default:
        return 'COMMON.ERROR.PAGE.DEFAULT.TITLE';
    }
  });
  readonly descriptionKey = computed(() => {
    const message = this.error()?.message;

    if (message) {
      return message;
    }

    switch (this.error()?.status) {
      case 'NOT_FOUND':
        return 'COMMON.ERROR.PAGE.NOT_FOUND.DESCRIPTION';
      case 'BAD_REQUEST':
        return 'COMMON.ERROR.PAGE.BAD_REQUEST.DESCRIPTION';
      case 'SERVER_ERROR':
        return 'COMMON.ERROR.PAGE.SERVER_ERROR.DESCRIPTION';
      default:
        return 'COMMON.ERROR.PAGE.DEFAULT.DESCRIPTION';
    }
  });

  constructor() {
    effect(() => {
      const error = this.error();
      if (!error) {
        return;
      }
      if (!['NO_CONTENT', 'no_content_error'].includes(error.status || '')) {
        if (error.status === 'NOT_FOUND') {
          this.imageSrc = './assets/not_found.svg';
          this.retry = false;
        } else {
          this.imageSrc = './assets/error.svg';
          this.retry = error.status !== 'BAD_REQUEST';
        }
      }
    });
  }

  readonly errorCode = computed(() => this.error()?.status || 'ERROR');

  reload() {
    window.location.reload();
  }
}
