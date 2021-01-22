import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../store/app.states';
import { IUser } from '../interfaces/user';
import * as fromActionsLogin from '../store/auth.actions';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  title = 'Nails';
  menuItems = ['dashboard', 'users', 'products'];
  currentUser!: IUser | null;
  username: string | undefined;
  getState: Observable<any>;
  canChangePassword = false;

  showInitials = false;
  initials: string | undefined;

  constructor(private breakpointObserver: BreakpointObserver, private router: Router, private store: Store<AppState>) {
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
      new fromActionsLogin.LogOut()
    );
    this.router.navigate(['main']);
  }

}
