import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ReservationComponent } from './reservation.component';
import { ReservationDetailComponent } from './detail/reservation-detail.component';
import { MoreInfoComponent } from './detail/more-info/more-info.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ReservationCompleteComponent } from './detail/complete/reservation-complete.component';

const routes: Routes = [
  {
    path: 'search', component: SearchComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager, Role.professional]
    }
  },
  {
    path: 'calendar', component: CalendarComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager, Role.professional]
    }
  },
  {
    path: '', component: ReservationComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager, Role.professional] // TODO Customer not allowed
    }
  },
  {
    path: ':id/edit', component: ReservationComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager, Role.professional] // TODO Customer not allowed
    }
  },
  {
    path: ':id', component: ReservationDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager, Role.professional, Role.customer]
    }, runGuardsAndResolvers: 'always'
  },
  {
    path: ':id/complete', component: ReservationCompleteComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.professional]
    }, runGuardsAndResolvers: 'always'
  },
  {
    path: ':id/more-info', component: MoreInfoComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.professional, Role.manager]
    }, runGuardsAndResolvers: 'always'
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationRoutingModule {
}
