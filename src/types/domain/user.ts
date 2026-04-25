export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  display_name: string;
  phone: string | null;
  avatar_url: string | null;
  status: UserStatus;
}

export interface UserInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  display_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  status?: UserStatus;
}

export interface UserUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  display_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
  status?: UserStatus;
}
