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

export async function addGameParticipants(
  participants: GameParticipantInsert[],
): Promise<GameParticipant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_participants")
    .insert(participants)
    .select("*");

  if (error) {
    throw new Error(`add_game_participants_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function saveGameResults(
  results: GameResultInsert[],
): Promise<GameResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_results")
    .insert(results)
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
