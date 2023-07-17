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
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
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

const materialModules = [
  NgxMaterialTimepickerModule,
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
  MatBottomSheetModule
];

@NgModule({
  imports: [...materialModules],
  exports: [...materialModules]
})
export class AppMaterialModule {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIcon('IDEAL', this.getUrl('assets/banks/IDEAL.svg'));
    matIconRegistry.addSvgIcon('PAYPAL', this.getUrl('assets/banks/PAYPAL.svg'));
    matIconRegistry.addSvgIcon('RABONL2U', this.getUrl('assets/banks/RABONL2U.svg'));
    matIconRegistry.addSvgIcon('ABNANL2A', this.getUrl('assets/banks/ABNANL2A.svg'));
    matIconRegistry.addSvgIcon('FVLBNL22', this.getUrl('assets/banks/FVLBNL22.svg'));
    matIconRegistry.addSvgIcon('TRIONL2U', this.getUrl('assets/banks/TRIONL2U.svg'));
    matIconRegistry.addSvgIcon('INGBNL2A', this.getUrl('assets/banks/INGBNL2A.svg'));
    matIconRegistry.addSvgIcon('SNSBNL2A', this.getUrl('assets/banks/SNSBNL2A.svg'));
    matIconRegistry.addSvgIcon('ASNBNL21', this.getUrl('assets/banks/ASNBNL21.svg'));
    matIconRegistry.addSvgIcon('RBRBNL21', this.getUrl('assets/banks/RBRBNL21.svg'));
    matIconRegistry.addSvgIcon('KNABNL2H', this.getUrl('assets/banks/KNABNL2H.svg'));
    matIconRegistry.addSvgIcon('BUNQNL2A', this.getUrl('assets/banks/BUNQNL2A.svg'));
    matIconRegistry.addSvgIcon('MOYONL21', this.getUrl('assets/banks/MOYONL21.svg'));
    matIconRegistry.addSvgIcon('WHATSAPP', this.getUrl('assets/whatsapp.svg'));
    matIconRegistry.addSvgIcon('INSTAGRAM', this.getUrl('assets/instagram.svg'));
    matIconRegistry.addSvgIcon('FACEBOOK', this.getUrl('assets/facebook.svg'));
    matIconRegistry.addSvgIcon('MANICURE', this.getUrl('assets/manicure.svg'));
  }

  private getUrl(path: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(path);
  }
}
