import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
} from '@angular/core';
import { IFabMenu } from '../../reservation';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-fab-menu',
  templateUrl: './fab-menu.component.html',
  styleUrls: ['./fab-menu.component.scss'],
  imports: [MatIcon, MatButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabMenuComponent {
  private readonly elementRef: ElementRef = inject(ElementRef);

  fabMenus = input.required<IFabMenu[]>();

  fabMenuItemSelected = output<string>();

  menuOpen: boolean = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  @HostListener('document:click', ['$event']) clickOutsideMenu = (
    event: MouseEvent,
  ) => {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  };

  handleMenuItemClick = (item: any): void => {
    this.menuOpen = false;
    this.fabMenuItemSelected.emit(item.id);
  };
}
