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

export type GameReadyForResultCard = {
  circle: Pick<Circle, "name"> | null;
  game: Game;
  mvp_user: Pick<User, "display_name"> | null;
  result_count: number;
};

export type CreateResultCardForGameResult = {
  result_card: ResultCard;
  status: "already_exists" | "created";
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

export async function getLatestGameReadyForResultCardByStore(
  store_id: string,
): Promise<GameReadyForResultCard | null> {
  const supabase = await createClient();
  const { data: games, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("store_id", store_id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (gameError) {
    throw new Error(
      `get_latest_game_ready_for_result_card_by_store_failed: ${gameError.message}`,
    );
  }

  const gameRows = (games ?? []) as Game[];

  for (const game of gameRows) {
    const existingResultCard = await getResultCardByGameId(
      game.id,
      "get_latest_game_ready_for_result_card_by_store_failed",
    );

    if (existingResultCard) {
      continue;
    }

    const { data: results, error: resultError } = await supabase
      .from("game_results")
      .select("*")
      .eq("game_id", game.id)
      .order("rank", { ascending: true });

    if (resultError) {
      throw new Error(
        `get_latest_game_ready_for_result_card_by_store_failed: ${resultError.message}`,
      );
    }

    const resultRows = (results ?? []) as GameResult[];

    if (resultRows.length === 0) {
      continue;
    }

    const circle = await getCircleNameById(
      game.circle_id,
      "get_latest_game_ready_for_result_card_by_store_failed",
    );
    const mvpResult = resultRows.find((result) => result.is_mvp);
    const mvpUser = mvpResult
      ? await getUserDisplayNameById(
          mvpResult.user_id,
          "get_latest_game_ready_for_result_card_by_store_failed",
        )
      : null;

    return {
      circle,
      game,
      mvp_user: mvpUser,
      result_count: resultRows.length,
    };
  }

  return null;
}

export async function createResultCardForGame(
  game_id: string,
): Promise<CreateResultCardForGameResult> {
  const supabase = await createClient();
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", game_id)
    .maybeSingle();

  if (gameError) {
    throw new Error(`create_result_card_for_game_failed: ${gameError.message}`);
  }

  const gameRow = game as Game | null;

  if (!gameRow) {
    throw new Error("create_result_card_for_game_failed: game_not_found");
  }

  const existingResultCard = await getResultCardByGameId(
    game_id,
    "create_result_card_for_game_failed",
  );

  if (existingResultCard) {
    return {
      result_card: existingResultCard,
      status: "already_exists",
    };
  }

  const { data: results, error: resultError } = await supabase
    .from("game_results")
    .select("id")
    .eq("game_id", game_id)
    .limit(1);

  if (resultError) {
    throw new Error(
      `create_result_card_for_game_failed: ${resultError.message}`,
    );
  }

  if ((results ?? []).length === 0) {
    throw new Error("create_result_card_for_game_failed: game_results_required");
  }

  const circle = await getCircleNameById(
    gameRow.circle_id,
    "create_result_card_for_game_failed",
  );
  const { data: resultCard, error: resultCardError } = await supabase
    .from("result_cards")
    .insert({
      card_subtitle: "娱乐积分，仅作休闲记录",
      card_title: circle ? `${circle.name}战绩海报` : "麻将迷战绩海报",
      circle_id: gameRow.circle_id,
      game_id,
      generated_at: new Date().toISOString(),
      share_count: 0,
      store_id: gameRow.store_id,
    })
    .select("*")
    .single();

  if (resultCardError) {
    throw new Error(
      `create_result_card_for_game_failed: ${resultCardError.message}`,
    );
  }

  const { error: gameUpdateError } = await supabase
    .from("games")
    .update({ status: "card_generated" })
    .eq("id", game_id);

  if (gameUpdateError) {
    throw new Error(
      `create_result_card_for_game_failed: ${gameUpdateError.message}`,
    );
  }

  return {
    result_card: resultCard,
    status: "created",
  };
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

async function getResultCardByGameId(
  game_id: string,
  errorPrefix: string,
): Promise<ResultCard | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("result_cards")
    .select("*")
    .eq("game_id", game_id)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`${errorPrefix}: ${error.message}`);
  }

  return data;
}

async function getCircleNameById(
  circle_id: string | null,
  errorPrefix: string,
): Promise<Pick<Circle, "name"> | null> {
  if (!circle_id) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("circles")
    .select("name")
    .eq("id", circle_id)
    .maybeSingle();

  if (error) {
    throw new Error(`${errorPrefix}: ${error.message}`);
  }

  return data as Pick<Circle, "name"> | null;
}

async function getUserDisplayNameById(
  user_id: string,
  errorPrefix: string,
): Promise<Pick<User, "display_name"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user_id)
    .maybeSingle();

  if (error) {
    throw new Error(`${errorPrefix}: ${error.message}`);
  }

  return data as Pick<User, "display_name"> | null;
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
