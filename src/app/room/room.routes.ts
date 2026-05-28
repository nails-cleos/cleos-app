import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { CustomersComponent } from './me/customers/customers.component';
import { AddServiceComponent } from './me/add-service/add-service.component';
import { ExpenseComponent } from './me/expense/expense.component';
import { ExpensesComponent } from './me/expense/list/expenses.component';
import { RoomsComponent } from './list/rooms.component';
import { RoomComponent } from './room.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { AwsLambdaService } from '../services/aws-lambda.service';
import { ExpenseService } from '../services/expense.service';
import { RoomService } from '../services/room.service';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { AwsEffects } from '../store/effects/aws.effects';
import { ExpenseEffects } from '../store/effects/expense.effects';
import { RoomEffects } from '../store/effects/room.effects';
import { AWS_FEATURE_KEY, awsReducer } from '../store/reducers/aws.reducers';
import { ROOM_FEATURE_KEY, roomReducer } from '../store/reducers/room.reducers';
import { RoomNavigationEffects } from './room-navigation.effects';

const providers = [
  provideFeatureTranslations('room'),
  RoomService,
  UserService,
  ExpenseService,
  TokenService,
  AwsLambdaService,
  provideState(ROOM_FEATURE_KEY, roomReducer),
  provideState(AWS_FEATURE_KEY, awsReducer),
  provideEffects(RoomEffects, ExpenseEffects, AwsEffects, RoomNavigationEffects),
];

const children: Routes = [
  { path: '', component: RoomsComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager] } },
  { path: 'add', component: RoomComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager] } },
  { path: ':id/services', component: AddServiceComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager] } },
  { path: ':id/expenses', component: ExpensesComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager] } },
  { path: ':id/expenses/add', component: ExpenseComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager] } },
  { path: ':id/expenses/:expenseId', component: ExpenseComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager] } },
  { path: 'me/:id', component: RoomComponent, canActivate: [authGuard], data: { roles: [Role.professional, Role.manager] } },
  { path: ':id', component: RoomComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager] } },
  { path: ':id/customers', component: CustomersComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager] } },
];

export const ROOM_ROUTES: Routes = [{ path: '', providers, children }];
