import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class TranslationLoaderResolver {

  constructor(private translate: TranslateService) {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolve = (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> =>
    this.translate.get('APP.TITTLE');
}
