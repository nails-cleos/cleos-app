import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { AppMaterialModule } from '../../../util/app-material.module';

@Component({
  selector: 'app-link-message-snack-bar',
  templateUrl: './link-message-snack-bar.component.html',
  styleUrl: './link-message-snack-bar.component.scss',
  imports: [AppMaterialModule],
})
export class LinkMessageSnackBarComponent {

  link?: string;
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string; path: string, language: string } ) {
    if (data.path) {
      this.link = `${window.location.origin}/${data.language}/${data.path}`;
    }
  }
}
