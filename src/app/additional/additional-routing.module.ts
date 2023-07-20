import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { AdditionalComponent } from './additional.component';
import { AdditionalListComponent } from './list/additional-list.component';
import { AdditionalDetailComponent } from './detail/additional-detail.component';
import { AdditionalSortingComponent } from './sorting/additional-sorting.component';

const routes: Routes = [
  {
    path: '', component: AdditionalListComponent, canActivate: [authGuard], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'sorting', component: AdditionalSortingComponent, canActivate: [authGuard], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'add', component: AdditionalComponent, canActivate: [authGuard], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id', component: AdditionalDetailComponent, canActivate: [authGuard], data: {
      roles: [Role.admin]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdditionalRoutingModule {
}
