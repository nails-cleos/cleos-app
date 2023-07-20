import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private history: string[] = [];

  constructor(private router: Router) {
  }

  subscribe(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!event.urlAfterRedirects.includes('/payment/success?')
          && !event.urlAfterRedirects.includes('/payment/failure?')) {
          this.history.push(event.urlAfterRedirects);
        }
      }
    });
  }

  back(date?: Date): void {
    this.history.pop();
    if (this.history.length > 0) {
      const last = this.history[this.history.length - 1];
      this.router.navigate([last], { state: { date } });
    } else {
      this.reloadPage();
    }
  }

  reload(url: string[], data?: any, queryParams?: any): void {
    this.router.navigateByUrl('/auth/redirect', { skipLocationChange: true }).then(() =>
      this.router.navigate(url.filter(path => path), { state: data, queryParams }));
  }

  reloadPage(url: string = '/'): void {
    this.router.navigateByUrl(url).then(() => window.location.reload());
  }
}
