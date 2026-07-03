import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--app-avatar-size]': 'size()',
    '[style.--app-avatar-radius]': 'radius()',
    '[style.--app-avatar-border]': 'border()',
    '[style.--app-avatar-placeholder-border]': 'placeholderBorder()',
    '[style.--app-avatar-background]': 'background()',
    '[style.--app-avatar-placeholder-background]': 'placeholderBackground()',
    '[style.--app-avatar-box-shadow]': 'boxShadow()',
    '[style.--app-avatar-color]': 'color()',
    '[style.--app-avatar-font-size]': 'initialsSize()',
    '[style.--app-avatar-font-weight]': 'initialsWeight()',
    '[style.--app-avatar-letter-spacing]': 'initialsLetterSpacing()',
    '[style.--app-avatar-image-radius]': 'imageRadius()',
  },
})
export class AvatarComponent {
  src = input<string>();
  initials = input<string>();
  alt = input('profile');

  size = input('40px');
  radius = input('50%');
  border = input('1px solid var(--app-surface-card-border)');
  placeholderBorder = input<string>();
  background = input('var(--app-chip-ghost-bg)');
  placeholderBackground = input<string>();
  boxShadow = input('none');
  color = input('var(--app-surface-text)');
  initialsSize = input('1rem');
  initialsWeight = input('700');
  initialsLetterSpacing = input('0.05em');
  imageRadius = input('inherit');
}
