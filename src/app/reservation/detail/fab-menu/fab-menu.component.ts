import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, output } from '@angular/core';
import { iconChange, listAnimation } from '../../../util/animation';
import { IFabMenu } from '../../../interfaces/reservation';
import { AppMaterialModule } from '../../../util/app-material.module';

@Component({
  selector: 'app-fab-menu',
  templateUrl: './fab-menu.component.html',
  styleUrls: ['./fab-menu.component.scss'],
  animations: [listAnimation, iconChange],
  imports: [AppMaterialModule],
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

  @HostListener('document:click', ['$event']) clickOutsideMenu = (event: MouseEvent) => {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  };

  handleMenuItemClick = (item: any): void => {
    this.menuOpen = false;
    this.fabMenuItemSelected.emit(item.id);
  };
}
