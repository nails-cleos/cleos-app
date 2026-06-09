export interface IReview {
  id?: string;
  detail?: string;
  rating: number;
  reservationId?: string;
}

export class Review implements IReview {
  rating: number;

  constructor(rating: number) {
    this.rating = rating;
  }
}
