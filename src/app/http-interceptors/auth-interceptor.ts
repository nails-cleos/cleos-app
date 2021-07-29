import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppState, selectAuthState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { IUser } from '../interfaces/user';
import { TokenService } from '../services/token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  getState: Observable<any>;
  currentUser!: IUser;
  token!: string;

  constructor(private store: Store<AppState>, private tokenService: TokenService) {
    this.getState = this.store.select(selectAuthState);
    this.getState.subscribe((state) => {
      this.currentUser = state.user;
      this.token = state.token;
    });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.tokenService.user && this.tokenService.token) {
      req = req.clone({
        setHeaders: {
          authorization: this.tokenService.createTokenHeader()
        }
      });
    }

    return next.handle(req);
  }
}
