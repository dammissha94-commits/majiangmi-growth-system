import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  Circle,
  Game,
  GameParticipant,
  GameResult,
  ResultCard,
  ResultCardInsert,
  Store,
  User,
} from "@/types/domain";

export type ResultCardResultWithUser = GameResult & {
  user: Pick<User, "display_name"> | null;
};

export type PlayerResultCardDetails = {
  circle: Pick<Circle, "name"> | null;
  game: Pick<Game, "status"> | null;
  is_latest_demo: boolean;
  participants: GameParticipant[];
  result_card: ResultCard;
  results: ResultCardResultWithUser[];
  store: Pick<Store, "name"> | null;
};

export async function createResultCard(
  input: ResultCardInsert,
): Promise<ResultCard> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("result_cards")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`create_result_card_failed: ${error.message}`);
  }

  return data;
}

export async function getResultCardById(
  result_card_id: string,
): Promise<ResultCard | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("result_cards")
    .select("*")
    .eq("id", result_card_id)
    .maybeSingle();

  if (error) {
    throw new Error(`get_result_card_by_id_failed: ${error.message}`);
  }

  return data;
}

export async function getResultCardDetailsForPlayer(
  result_card_id: string,
): Promise<PlayerResultCardDetails | null> {
  const resultCard =
    result_card_id === "test" ? null : await getResultCardById(result_card_id);

  if (resultCard) {
    return getResultCardDetails(resultCard, false);
  }

  const latestResultCard = await getLatestResultCard();

  if (!latestResultCard) {
    return null;
  }

  return getResultCardDetails(latestResultCard, true);
}

export async function getLatestResultCardDetailsByStore(
  store_id: string,
): Promise<PlayerResultCardDetails | null> {
  const latestResultCard = await getLatestResultCardByStore(store_id);

  if (!latestResultCard) {
    return null;
  }

  return getResultCardDetails(latestResultCard, false);
}

async function getLatestResultCard(): Promise<ResultCard | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("result_cards")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`get_latest_result_card_failed: ${error.message}`);
  }

  return data;
}

async function getLatestResultCardByStore(
  store_id: string,
): Promise<ResultCard | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("result_cards")
    .select("*")
    .eq("store_id", store_id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `get_latest_result_card_by_store_failed: ${error.message}`,
    );
  }

  return data;
}

async function getResultCardDetails(
  resultCard: ResultCard,
  is_latest_demo: boolean,
): Promise<PlayerResultCardDetails> {
  const supabase = await createClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("name")
    .eq("id", resultCard.store_id)
    .maybeSingle();

  if (storeError) {
    throw new Error(`get_result_card_details_failed: ${storeError.message}`);
  }

  const { data: circle, error: circleError } = resultCard.circle_id
    ? await supabase
        .from("circles")
        .select("name")
        .eq("id", resultCard.circle_id)
        .maybeSingle()
    : { data: null, error: null };

  if (circleError) {
    throw new Error(`get_result_card_details_failed: ${circleError.message}`);
  }

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("status")
    .eq("id", resultCard.game_id)
    .maybeSingle();

  if (gameError) {
    throw new Error(`get_result_card_details_failed: ${gameError.message}`);
  }

  const { data: participants, error: participantError } = await supabase
    .from("game_participants")
    .select("*")
    .eq("game_id", resultCard.game_id)
    .order("seat_no", { ascending: true });

  if (participantError) {
    throw new Error(
      `get_result_card_details_failed: ${participantError.message}`,
    );
  }

  const { data: results, error: resultError } = await supabase
    .from("game_results")
    .select("*")
    .eq("game_id", resultCard.game_id)
    .order("rank", { ascending: true });

  if (resultError) {
    throw new Error(`get_result_card_details_failed: ${resultError.message}`);
  }

  const participantRows = (participants ?? []) as GameParticipant[];
  const resultRows = (results ?? []) as GameResult[];
  const userIds = Array.from(
    new Set([
      ...participantRows.map((participant) => participant.user_id),
      ...resultRows.map((result) => result.user_id),
    ]),
  );

  const { data: users, error: userError } =
    userIds.length > 0
      ? await supabase
          .from("users")
          .select("id, display_name")
          .in("id", userIds)
      : { data: [], error: null };

  if (userError) {
    throw new Error(`get_result_card_details_failed: ${userError.message}`);
  }

  const usersById = new Map(
    ((users ?? []) as Pick<User, "id" | "display_name">[]).map((user) => [
      user.id,
      user,
    ]),
  );

  return {
    circle: circle as Pick<Circle, "name"> | null,
    game: game as Pick<Game, "status"> | null,
    is_latest_demo,
    participants: participantRows,
    result_card: resultCard,
    results: resultRows.map((result) => ({
      ...result,
      user: usersById.get(result.user_id) ?? null,
    })),
    store: store as Pick<Store, "name"> | null,
  };
}

export async function incrementResultCardShareCount(
  result_card_id: string,
): Promise<ResultCard> {
  const current = await getResultCardById(result_card_id);

  if (!current) {
    throw new Error("increment_result_card_share_count_failed: card_not_found");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("result_cards")
    .update({ share_count: current.share_count + 1 })
    .eq("id", result_card_id)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `increment_result_card_share_count_failed: ${error.message}`,
    );
  }

  return data;
}
