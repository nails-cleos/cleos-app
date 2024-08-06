import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { RoomsComponent } from './list/rooms.component';
import { RoomComponent } from './room.component';
import { AddServiceComponent } from './me/add-service/add-service.component';
import { ExpensesComponent } from './me/expense/list/expenses.component';
import { ExpenseComponent } from './me/expense/expense.component';
import { CustomersComponent } from './me/customers/customers.component';

const routes: Routes = [
  {
    path: '', component: RoomsComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager]
    }
  },
  {
    path: 'add', component: RoomComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager]
    }
  },
  {
    path: ':id/services', component: AddServiceComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager]
    }
  },
  {
    path: ':id/expenses', component: ExpensesComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager]
    }
  },
  {
    path: ':id/expenses/add', component: ExpenseComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager]
    }
  },
  {
    path: ':id/expenses/:expenseId', component: ExpenseComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager]
    }
  },
  {
    path: 'me/:id', component: RoomComponent, canActivate: [authGuard], data: {
      roles: [Role.professional, Role.manager] // TODO is not working
    }
  },
  {
    path: ':id', component: RoomComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager]
    }
  },
  {
    path: ':id/customers', component: CustomersComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoomRoutingModule {
}
