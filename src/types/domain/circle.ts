export type CircleStatus = "active" | "inactive" | "archived";

export type CircleMemberRole = "owner" | "member";

export interface Circle {
  id: string;
  created_at: string;
  updated_at: string;
  store_id: string;
  owner_user_id: string;
  name: string;
  description: string | null;
  member_count: number;
  game_count: number;
  last_active_at: string | null;
  status: CircleStatus;
}

export interface CircleInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id: string;
  owner_user_id: string;
  name: string;
  description?: string | null;
  member_count?: number;
  game_count?: number;
  last_active_at?: string | null;
  status?: CircleStatus;
}

export interface CircleUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id?: string;
  owner_user_id?: string;
  name?: string;
  description?: string | null;
  member_count?: number;
  game_count?: number;
  last_active_at?: string | null;
  status?: CircleStatus;
}

export interface CircleMember {
  id: string;
  created_at: string;
  updated_at: string;
  circle_id: string;
  user_id: string;
  role: CircleMemberRole;
  joined_at: string;
}

export interface CircleMemberInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  circle_id: string;
  user_id: string;
  role?: CircleMemberRole;
  joined_at?: string;
}

export interface CircleMemberUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  circle_id?: string;
  user_id?: string;
  role?: CircleMemberRole;
  joined_at?: string;
}
