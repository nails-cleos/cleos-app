import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { CustomersComponent } from './me/customers/customers.component';
import { AddServiceComponent } from './me/add-service/add-service.component';
import { ExpenseListComponent } from './me/expense/list/expense-list.component';
import { RoomListComponent } from './list/room-list.component';
import { RoomCreatePageComponent } from './room-create-page.component';
import { RoomDetailsPageComponent } from './room-details-page.component';
import { ExpenseCreatePageComponent } from './me/expense/expense-create-page.component';
import { ExpenseDetailsPageComponent } from './me/expense/expense-details-page.component';
import { RoomMeDetailsPageComponent } from './room-me-details-page.component';
import { AwsLambdaService } from '../services/aws-lambda.service';
import { ExpenseService } from '../services/expense.service';
import { RoomService } from '../services/room.service';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('room'),
  RoomService,
  UserService,
  ExpenseService,
  TokenService,
  AwsLambdaService,
];

const children: Routes = [
  { path: '', component: RoomListComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager] } },
  {
    path: 'add',
    component: RoomCreatePageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager] },
  },
  {
    path: ':id/services',
    component: AddServiceComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager] },
  },
  {
    path: ':id/expenses',
    component: ExpenseListComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager] },
  },
  {
    path: ':id/expenses/add',
    component: ExpenseCreatePageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager] },
  },
  {
    path: ':id/expenses/:expenseId',
    component: ExpenseDetailsPageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager] },
  },
  {
    path: 'me/:id',
    component: RoomMeDetailsPageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.professional, Role.manager] },
  },
  {
    path: ':id',
    component: RoomDetailsPageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager] },
  },
  {
    path: ':id/customers',
    component: CustomersComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager] },
  },
];

export const ROOM_ROUTES: Routes = [{ path: '', providers, children }];
