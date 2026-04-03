import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LayoutModule } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatStep, MatStepLabel, MatStepper } from '@angular/material/stepper';
import { TimepickerComponent } from '../shared/clock-timepicker/timepicker.component';
import { TimepickerDirective } from '../shared/clock-timepicker/timepicker.directive';

const materialModules = [
  TimepickerComponent,
  TimepickerDirective,
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatDialogModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatSelectModule,
  MatSortModule,
  MatTableModule,
  MatTooltipModule,
  MatCheckboxModule,
  MatRadioModule,
  MatSlideToggleModule,
  LayoutModule,
  MatSidenavModule,
  MatChipsModule,
  MatExpansionModule,
  MatTabsModule,
  MatBottomSheetModule,
  MatToolbarModule,
  MatBadgeModule,
  DragDropModule,
  MatProgressBar,
  MatStepper,
  MatStep,
  MatStepLabel,
];

@NgModule({
  imports: [...materialModules],
  exports: [...materialModules],
})
export class AppMaterialModule {
  constructor(matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIcon('CLEOS', this.getUrl('assets/icons/safari-pinned-tab.svg'));
    matIconRegistry.addSvgIcon('CLEOS-COLOR', this.getUrl('assets/icons/icon.svg'));
    matIconRegistry.addSvgIcon('MANICURE', this.getUrl('assets/treatment.svg'));
    matIconRegistry.addSvgIcon('WHATSAPP', this.getUrl('assets/whatsapp.svg'));
    matIconRegistry.addSvgIcon('WHATSAPP-NO-COLOR', this.getUrl('assets/whatsapp-no-color.svg'));
    matIconRegistry.addSvgIcon('INSTAGRAM', this.getUrl('assets/instagram.svg'));
    matIconRegistry.addSvgIcon('INSTAGRAM-NO-COLOR', this.getUrl('assets/instagram-no-color.svg'));
    matIconRegistry.addSvgIcon('FACEBOOK', this.getUrl('assets/facebook.svg'));
    matIconRegistry.addSvgIcon('FACEBOOK-NO-COLOR', this.getUrl('assets/facebook-no-color.svg'));
    matIconRegistry.addSvgIcon('IDEAL', this.getUrl('assets/payment_methods/ideal.svg'));
    matIconRegistry.addSvgIcon('PAYPAL', this.getUrl('assets/payment_methods/paypal.svg'));
    matIconRegistry.addSvgIcon('MOLLIE', this.getUrl('assets/payment_methods/mollie.svg'));
    matIconRegistry.addSvgIcon('PAY_NL', this.getUrl('assets/payment_methods/paynl.svg'));
  }

  private getUrl = (path: string): SafeResourceUrl => this.domSanitizer.bypassSecurityTrustResourceUrl(path);
}
