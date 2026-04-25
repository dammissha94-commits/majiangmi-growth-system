import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  CircleMember,
  Game,
  GameInsert,
  GameParticipant,
  GameParticipantInsert,
  GameResult,
  GameResultInsert,
  GameStatus,
  User,
} from "@/types/domain";

export type GameDraftInput = {
  circle_id: string | null;
  reservation_id: string | null;
  room_id: string | null;
  store_id: string;
};

export type GameParticipantWithUser = GameParticipant & {
  user: Pick<User, "display_name"> | null;
};

export type AddFourParticipantsResult = {
  game_id: string;
  participants: GameParticipantWithUser[];
  status: "already_exists" | "created";
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

export async function getLatestGameDraftByStore(
  store_id: string,
): Promise<Game | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("store_id", store_id)
    .in("status", ["created", "waiting_players"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `get_latest_game_draft_by_store_failed: ${error.message}`,
    );
  }

  return data;
}

export async function addFourParticipantsFromCircle(
  game_id: string,
): Promise<AddFourParticipantsResult> {
  const supabase = await createClient();
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", game_id)
    .maybeSingle();

  if (gameError) {
    throw new Error(
      `add_four_participants_from_circle_failed: ${gameError.message}`,
    );
  }

  const gameRow = game as Game | null;

  if (!gameRow) {
    throw new Error("add_four_participants_from_circle_failed: game_not_found");
  }

  if (!gameRow.circle_id) {
    throw new Error(
      "add_four_participants_from_circle_failed: 当前牌局没有绑定熟人圈，无法自动添加参与玩家",
    );
  }

  const existingParticipants = await listGameParticipantsWithUsers(game_id);

  if (existingParticipants.length > 0) {
    return {
      game_id,
      participants: existingParticipants,
      status: "already_exists",
    };
  }

  const { data: circleMembers, error: memberError } = await supabase
    .from("circle_members")
    .select("*")
    .eq("circle_id", gameRow.circle_id)
    .order("joined_at", { ascending: true })
    .limit(4);

  if (memberError) {
    throw new Error(
      `add_four_participants_from_circle_failed: ${memberError.message}`,
    );
  }

  const memberRows = (circleMembers ?? []) as CircleMember[];

  if (memberRows.length < 4) {
    throw new Error(
      "add_four_participants_from_circle_failed: 熟人圈成员不足4人，无法添加完整参与玩家",
    );
  }

  const participantInput: GameParticipantInsert[] = memberRows.map(
    (member, index) => ({
      game_id,
      seat_no: index + 1,
      user_id: member.user_id,
    }),
  );
  const { error: participantError } = await supabase
    .from("game_participants")
    .insert(participantInput);

  if (participantError) {
    throw new Error(
      `add_four_participants_from_circle_failed: ${participantError.message}`,
    );
  }

  return {
    game_id,
    participants: await listGameParticipantsWithUsers(game_id),
    status: "created",
  };
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

async function listGameParticipantsWithUsers(
  game_id: string,
): Promise<GameParticipantWithUser[]> {
  const supabase = await createClient();
  const { data: participants, error: participantError } = await supabase
    .from("game_participants")
    .select("*")
    .eq("game_id", game_id)
    .order("seat_no", { ascending: true });

  if (participantError) {
    throw new Error(
      `add_four_participants_from_circle_failed: ${participantError.message}`,
    );
  }

  const participantRows = (participants ?? []) as GameParticipant[];

  if (participantRows.length === 0) {
    return [];
  }

  const userIds = Array.from(
    new Set(participantRows.map((participant) => participant.user_id)),
  );
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id, display_name")
    .in("id", userIds);

  if (userError) {
    throw new Error(
      `add_four_participants_from_circle_failed: ${userError.message}`,
    );
  }

  const usersById = new Map(
    ((users ?? []) as Pick<User, "id" | "display_name">[]).map((user) => [
      user.id,
      user,
    ]),
  );

  return participantRows.map((participant) => ({
    ...participant,
    user: usersById.get(participant.user_id) ?? null,
  }));
}
