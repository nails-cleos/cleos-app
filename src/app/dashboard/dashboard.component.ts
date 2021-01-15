import { Component, Input, OnInit } from '@angular/core';
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

  showInitials = false;
  initials: string | undefined;

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
        if (user.firstName) {
          this.username = `${user.firstName} ${user?.lastName}`;
          this.initials = `${user.firstName.charAt(0)} ${user?.lastName?.charAt(0)}`;
        } else {
          this.username = user?.username;
          this.initials = user?.username?.charAt(0);
        }

        if (!this.currentUser?.imageUrl) {
          this.showInitials = true;
        }
      }
    });
  }

  logout(): void {
    this.store.dispatch(
      new fromActionsLogin.Clean()
    );
    this.router.navigate(['dashboard', 'main']);
  }
}
