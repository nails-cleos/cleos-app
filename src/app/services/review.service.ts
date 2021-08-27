import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IReview } from '../interfaces/review';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  url = 'reviews';

  constructor(private http: HttpClient) {
  }

  public add(review: IReview): Observable<IReview> {
    return this.http.post<IReview>(this.url, review);
  }
}
