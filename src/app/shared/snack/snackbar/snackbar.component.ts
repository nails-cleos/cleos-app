import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { AppMaterialModule } from '../../../util/app-material.module';

@Component({
  selector: 'app-snackbar',
  imports: [AppMaterialModule],
  templateUrl: 'snackbar.component.html',
  styleUrl: 'snackbar.component.scss'
})
export class SnackbarComponent {
  data = inject(MAT_SNACK_BAR_DATA);
  snackBarRef = inject(MatSnackBarRef<SnackbarComponent>);
}
