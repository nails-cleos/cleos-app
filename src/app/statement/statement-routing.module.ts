import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { StatementComponent } from './statement.component';

const routes: Routes = [
  {
    path: '', component: StatementComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatementRoutingModule {
}
