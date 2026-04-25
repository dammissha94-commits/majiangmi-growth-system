export type MembershipStatus = "active" | "inactive";

export interface Membership {
  id: string;
  created_at: string;
  updated_at: string;
  store_id: string;
  user_id: string;
  member_level: string;
  visit_count: number;
  game_count: number;
  last_visit_at: string | null;
  tags: string[];
  status: MembershipStatus;
}

export interface MembershipInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id: string;
  user_id: string;
  member_level?: string;
  visit_count?: number;
  game_count?: number;
  last_visit_at?: string | null;
  tags?: string[];
  status?: MembershipStatus;
}

export interface MembershipUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id?: string;
  user_id?: string;
  member_level?: string;
  visit_count?: number;
  game_count?: number;
  last_visit_at?: string | null;
  tags?: string[];
  status?: MembershipStatus;
}
