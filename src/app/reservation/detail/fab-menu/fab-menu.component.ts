import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { iconChange, listAnimation } from '../../../util/animation';
import { IFabMenu } from '../../../interfaces/reservation';

@Component({
  selector: 'app-fab-menu',
  templateUrl: './fab-menu.component.html',
  styleUrls: ['./fab-menu.component.scss'],
  animations: [listAnimation, iconChange]
})
export class FabMenuComponent {
  @Input() fabMenus!: IFabMenu[];
  @Output() fabMenuItemSelected: EventEmitter<string> = new EventEmitter<string>();

  menuOpen: boolean;

  constructor(private elementRef: ElementRef) {
    this.menuOpen = false;
  }

  get toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    return;
  }

  @HostListener('document:click', ['$event'])
  clickOutsideMenu(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }

  handleMenuItemClick(item: any): void {
    this.menuOpen = false;
    this.fabMenuItemSelected.emit(item.id);
  }
}
