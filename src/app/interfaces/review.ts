export interface IReview {
  id?: string;
  detail?: string;
  rating: number;
  reservationId?: string;
}

export interface IReviewAll {
  id: string;
  detail?: string;
  rating: number;
}

export class Review implements IReview {
  rating: number;
  constructor(rating: number) {
    this.rating = rating;
  }
}
