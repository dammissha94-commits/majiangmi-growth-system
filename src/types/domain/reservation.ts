export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "arrived"
  | "playing"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Reservation {
  id: string;
  created_at: string;
  updated_at: string;
  store_id: string;
  room_id: string;
  circle_id: string | null;
  user_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  source: string;
  status: ReservationStatus;
}

export interface ReservationInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id: string;
  room_id: string;
  circle_id?: string | null;
  user_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  source?: string;
  status?: ReservationStatus;
}

export interface ReservationUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id?: string;
  room_id?: string;
  circle_id?: string | null;
  user_id?: string;
  reservation_date?: string;
  start_time?: string;
  end_time?: string;
  source?: string;
  status?: ReservationStatus;
}
