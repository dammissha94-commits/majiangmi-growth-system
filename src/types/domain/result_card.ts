export interface ResultCard {
  id: string;
  created_at: string;
  updated_at: string;
  game_id: string;
  store_id: string;
  circle_id: string | null;
  card_title: string;
  card_subtitle: string | null;
  share_count: number;
  generated_at: string;
}

export interface ResultCardInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  game_id: string;
  store_id: string;
  circle_id?: string | null;
  card_title: string;
  card_subtitle?: string | null;
  share_count?: number;
  generated_at?: string;
}

export interface ResultCardUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  game_id?: string;
  store_id?: string;
  circle_id?: string | null;
  card_title?: string;
  card_subtitle?: string | null;
  share_count?: number;
  generated_at?: string;
}
