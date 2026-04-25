import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  Game,
  GameInsert,
  GameParticipant,
  GameParticipantInsert,
  GameResult,
  GameResultInsert,
  GameStatus,
} from "@/types/domain";

export type GameDraftInput = {
  circle_id: string | null;
  reservation_id: string | null;
  room_id: string | null;
  store_id: string;
};

export async function createGame(input: GameInsert): Promise<Game> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`create_game_failed: ${error.message}`);
  }

  return data;
}

export async function createGameDraft(input: GameDraftInput): Promise<Game> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .insert({
      circle_id: input.circle_id,
      ended_at: null,
      game_count: 1,
      reservation_id: input.reservation_id,
      room_id: input.room_id,
      started_at: null,
      status: "created",
      store_id: input.store_id,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`create_game_draft_failed: ${error.message}`);
  }

  return data;
}

export async function listGamesByStore(store_id: string): Promise<Game[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("store_id", store_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`list_games_by_store_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function listRecentGameDrafts(
  store_id: string,
): Promise<Game[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("store_id", store_id)
    .eq("status", "created")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`list_recent_game_drafts_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function addGameParticipants(
  input: GameParticipantInsert[],
): Promise<GameParticipant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_participants")
    .insert(input)
    .select("*");

  if (error) {
    throw new Error(`add_game_participants_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function saveGameResults(
  input: GameResultInsert[],
): Promise<GameResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_results")
    .insert(input)
    .select("*");

  if (error) {
    throw new Error(`save_game_results_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function updateGameStatus(
  game_id: string,
  status: GameStatus,
): Promise<Game> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .update({ status })
    .eq("id", game_id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`update_game_status_failed: ${error.message}`);
  }

  return data;
}
