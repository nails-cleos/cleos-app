export interface MeReservationParams {
  treatmentId?: string;
  roomId?: string;
  professionalId?: string;
  date?: Date;
  discountId?: string;
}

export interface CurrentCompleteReservationParams {
  reservationId: string;
  roomId: string;
  customerId: string;
  isDashboard: boolean;
}

export interface DetailReservationParams {
  step?: number;
}

export interface ReservationParams {
  isDashboard: boolean;
  skip: boolean;
  customerId?: string;
  roomId?: string;
  treatmentId?: string;
  groupId?: string;
  professionalId?: string;
  additionalIds?: string[];
  date?: Date;
  discountId?: string;
}
