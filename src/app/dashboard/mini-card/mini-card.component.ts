import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ErrorComponent } from '@app/shared/error/error.component';
import { IError } from '@app/interfaces/common';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSuffix } from '@angular/material/input';
import { NgClass, PercentPipe } from '@angular/common';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-mini-card',
  templateUrl: './mini-card.component.html',
  styleUrls: ['./mini-card.component.scss'],
  imports: [ErrorComponent, MatCard, MatIcon, MatSuffix, PercentPipe, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniCardComponent {
  private readonly navigationService: NavigationService =
    inject(NavigationService);

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

  language: string = this.navigationService.language;
}
