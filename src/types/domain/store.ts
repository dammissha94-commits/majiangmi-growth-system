export type StoreStatus = "active" | "inactive";

export interface Store {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  brand_name: string | null;
  address: string | null;
  contact_phone: string | null;
  opening_hours: string | null;
  status: StoreStatus;
}

export interface StoreInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  brand_name?: string | null;
  address?: string | null;
  contact_phone?: string | null;
  opening_hours?: string | null;
  status?: StoreStatus;
}

export interface StoreUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  name?: string;
  brand_name?: string | null;
  address?: string | null;
  contact_phone?: string | null;
  opening_hours?: string | null;
  status?: StoreStatus;
}
