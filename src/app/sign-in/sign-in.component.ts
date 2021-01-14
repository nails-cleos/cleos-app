import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as fromActionsLogin from '../store/auth.actions';
import { IUser } from '../interfaces/user';
import { Observable } from 'rxjs';
import { AppState, selectAuthState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  hide = true;
  form!: FormGroup;
  user: IUser | undefined;
  getState: Observable<any>;

  constructor(private formBuilder: FormBuilder, private store: Store<AppState>, private route: ActivatedRoute,
              private snackBar: MatSnackBar, private router: Router) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  clean(): void {
    this.store.dispatch(
      new fromActionsLogin.Clean()
    );
  }

  subscribe(): void {
    this.getState.subscribe((state) => {
      if (state.isAuthenticated) {
        this.router.navigate(['dashboard', 'main']);
      }
      if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
      }
    });
  }

  signIn(): void {
    if (this.form.invalid) {
      return;
    }
    const username: string = this.form.get('username')?.value.trim();
    const password: string = this.form.get('password')?.value.trim();

    this.store.dispatch(
      new fromActionsLogin.Login({username, password, queryParams: this.route.snapshot.queryParams})
    );
  }
}
