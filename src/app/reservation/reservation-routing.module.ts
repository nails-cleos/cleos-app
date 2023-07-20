import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ReservationComponent } from './reservation.component';
import { ReservationDetailComponent } from './detail/reservation-detail.component';
import { MoreInfoComponent } from './detail/more-info/more-info.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ReservationCompleteComponent } from './detail/complete/reservation-complete.component';
import { InvoiceComponent } from '../invoice/invoice.component';

const routes: Routes = [
  {
    path: 'search', component: SearchComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.professional]
    }
  },
  {
    path: 'invoices', component: InvoiceComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.professional]
    }
  },
  {
    path: 'calendar', component: CalendarComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.professional]
    }
  },
  {
    path: '', component: ReservationComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.roomAdmin, Role.professional] // Customer not allowed
    }
  },
  {
    path: ':id/edit', component: ReservationComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.roomAdmin, Role.professional] // Customer not allowed
    }
  },
  {
    path: ':id', component: ReservationDetailComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.roomAdmin, Role.professional, Role.customer]
    }, runGuardsAndResolvers: 'always'
  },
  {
    path: ':id/rooms/:roomId/customer/:customerId/complete',
    component: ReservationCompleteComponent,
    canActivate: [authGuard],
    data: {
      roles: [Role.professional, Role.roomAdmin]
    },
    runGuardsAndResolvers: 'always'
  },
  {
    path: ':id/more-info', component: MoreInfoComponent, canActivate: [authGuard], data: {
      roles: [Role.professional, Role.manager, Role.roomAdmin]
    }, runGuardsAndResolvers: 'always'
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationRoutingModule {
}
