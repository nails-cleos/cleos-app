import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { ErrorComponent } from '../../shared/error/error.component';
import { IError } from '../../interfaces/common';

@Component({
  selector: 'app-mini-card',
  templateUrl: './mini-card.component.html',
  styleUrls: ['./mini-card.component.scss'],
  imports: [SharedModule, ErrorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniCardComponent {
  private readonly translate: TranslateService = inject(TranslateService);

  title = input.required<string>();
  icon = input<string>();
  duration = input<string>();
  period = input<string>();
  previousPeriod = input<string>();
  projection = input<string>();
  percentValue = input<number>();
  value = input<number | string>();
  previousPeriodValue = input<number | string>();
  color = input<ThemePalette>();
  isIncrease = input<boolean>();
  isInfinity = input<boolean>();
  isCurrency = input<boolean>();
  isProjection = input<boolean>();
  isLoading = input<boolean>();
  error = input<IError>();

  locale: string = this.translate.currentLang;
}
