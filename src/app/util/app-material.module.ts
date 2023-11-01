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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';

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
  MatBottomSheetModule,
  MatToolbarModule,
  MatBadgeModule
];

@NgModule({
  imports: [...materialModules],
  exports: [...materialModules]
})
export class AppMaterialModule {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIcon('CLEOS', this.getUrl('assets/icons/safari-pinned-tab.svg'));
    matIconRegistry.addSvgIcon('WHATSAPP', this.getUrl('assets/whatsapp.svg'));
    matIconRegistry.addSvgIcon('INSTAGRAM', this.getUrl('assets/instagram.svg'));
    matIconRegistry.addSvgIcon('FACEBOOK', this.getUrl('assets/facebook.svg'));
    matIconRegistry.addSvgIcon('/payment_methods/1.svg', this.getUrl('assets/payment_methods/1.svg'));
    matIconRegistry.addSvgIcon('IDEAL', this.getUrl('assets/payment_methods/1.svg'));
    matIconRegistry.addSvgIcon('/payment_methods/2.svg', this.getUrl('assets/payment_methods/2.svg'));
    matIconRegistry.addSvgIcon('/payment_methods/21.svg', this.getUrl('assets/payment_methods/21.svg'));
    matIconRegistry.addSvgIcon('PAYPAL', this.getUrl('assets/payment_methods/21.svg'));
    matIconRegistry.addSvgIcon('PAY_NL', this.getUrl('assets/payment_methods/paynl.svg'));
    matIconRegistry.addSvgIcon('/issuers/1.svg', this.getUrl('assets/issuers/1.svg'));
    matIconRegistry.addSvgIcon('/issuers/2.svg', this.getUrl('assets/issuers/2.svg'));
    matIconRegistry.addSvgIcon('/issuers/4.svg', this.getUrl('assets/issuers/4.svg'));
    matIconRegistry.addSvgIcon('/issuers/5.svg', this.getUrl('assets/issuers/5.svg'));
    matIconRegistry.addSvgIcon('/issuers/8.svg', this.getUrl('assets/issuers/8.svg'));
    matIconRegistry.addSvgIcon('/issuers/9.svg', this.getUrl('assets/issuers/9.svg'));
    matIconRegistry.addSvgIcon('/issuers/10.svg', this.getUrl('assets/issuers/10.svg'));
    matIconRegistry.addSvgIcon('/issuers/11.svg', this.getUrl('assets/issuers/11.svg'));
    matIconRegistry.addSvgIcon('/issuers/12.svg', this.getUrl('assets/issuers/12.svg'));
    matIconRegistry.addSvgIcon('/issuers/5080.svg', this.getUrl('assets/issuers/5080.svg'));
    matIconRegistry.addSvgIcon('/issuers/5084.svg', this.getUrl('assets/issuers/5084.svg'));
    matIconRegistry.addSvgIcon('/issuers/23355.svg', this.getUrl('assets/issuers/23355.svg'));
    matIconRegistry.addSvgIcon('/issuers/23358.svg', this.getUrl('assets/issuers/23358.svg'));
    matIconRegistry.addSvgIcon('/issuers/23361.svg', this.getUrl('assets/issuers/23361.svg'));
    matIconRegistry.addSvgIcon('MOYONL21', this.getUrl('assets/issuers/MOYONL21.svg'));
  }

  private getUrl(path: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(path);
  }
}
