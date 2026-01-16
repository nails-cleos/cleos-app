import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { DocumentComponent } from './document.component';

const routes: Routes = [
  {
    path: '', component: DocumentComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentRoutingModule {
}
