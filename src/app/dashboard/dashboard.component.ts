import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Menu, MENUS } from '../interfaces/menu';
import { IUser } from '../interfaces/user';
import { AppState, selectAuthState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromActionsLogin from '../store/auth.actions';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  title = 'Nails';
  menus: Menu[] = MENUS;
  currentUser!: IUser | null;
  username: string | undefined;
  getState: Observable<any>;
  canChangePassword = false;

  constructor(private router: Router, private store: Store<AppState>) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.subscribe();
  }

  subscribe(): void {
    this.getState.subscribe((state) => {
      if (state.isAuthenticated) {
        const user = state.user;
        this.currentUser = user;
        this.canChangePassword = user?.provider === 'LOCAL';
        this.username = user?.firstName ? `${user.firstName} ${user?.lastName}` : user?.username;
      }
    });
  }

  logout(): void {
    this.store.dispatch(
      new fromActionsLogin.LogOut()
    );
    this.router.navigate(['dashboard', 'main']);
  }
}
