export type RoomStatus = "active" | "inactive";

export interface Room {
  id: string;
  created_at: string;
  updated_at: string;
  store_id: string;
  name: string;
  capacity: number;
  floor_label: string | null;
  status: RoomStatus;
}

export interface RoomInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id: string;
  name: string;
  capacity?: number;
  floor_label?: string | null;
  status?: RoomStatus;
}

export interface RoomUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id?: string;
  name?: string;
  capacity?: number;
  floor_label?: string | null;
  status?: RoomStatus;
}
