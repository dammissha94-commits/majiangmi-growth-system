export type GameStatus =
  | "created"
  | "waiting_players"
  | "playing"
  | "result_pending"
  | "completed"
  | "card_generated"
  | "shared"
  | "archived";

export interface Game {
  id: string;
  created_at: string;
  updated_at: string;
  store_id: string;
  room_id: string | null;
  circle_id: string | null;
  reservation_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  game_count: number;
  status: GameStatus;
}

export interface GameInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id: string;
  room_id?: string | null;
  circle_id?: string | null;
  reservation_id?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  game_count?: number;
  status?: GameStatus;
}

export interface GameUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id?: string;
  room_id?: string | null;
  circle_id?: string | null;
  reservation_id?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  game_count?: number;
  status?: GameStatus;
}

export interface GameParticipant {
  id: string;
  created_at: string;
  updated_at: string;
  game_id: string;
  user_id: string;
  seat_no: number;
  joined_at: string;
}

export interface GameParticipantInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  game_id: string;
  user_id: string;
  seat_no: number;
  joined_at?: string;
}

export interface GameParticipantUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  game_id?: string;
  user_id?: string;
  seat_no?: number;
  joined_at?: string;
}

export interface GameResult {
  id: string;
  created_at: string;
  updated_at: string;
  game_id: string;
  participant_id: string;
  user_id: string;
  entertainment_score: number;
  rank: number;
  is_mvp: boolean;
  note: string | null;
}

export interface GameResultInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  game_id: string;
  participant_id: string;
  user_id: string;
  entertainment_score?: number;
  rank: number;
  is_mvp?: boolean;
  note?: string | null;
}

export interface GameResultUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  game_id?: string;
  participant_id?: string;
  user_id?: string;
  entertainment_score?: number;
  rank?: number;
  is_mvp?: boolean;
  note?: string | null;
}
