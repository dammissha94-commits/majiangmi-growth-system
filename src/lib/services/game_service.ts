import { createSupabaseServerClient } from "@/lib/supabase/server";

export type GameDraftStatus =
  | "created"
  | "waiting_players"
  | "playing"
  | "result_pending"
  | "completed"
  | "card_generated"
  | "shared"
  | "archived";

export type GameDraft = {
  id: string;
  created_at: string;
  store_id: string;
  game_count: number;
  status: GameDraftStatus;
};

export type CreateGameDraftInput = {
  storeId?: string;
  gameCount?: number;
};

export type CreateGameDraftResult =
  | {
      ok: true;
      game: GameDraft;
    }
  | {
      ok: false;
      error: string;
    };

function normalizeGameCount(value: number | undefined): number {
  if (!Number.isInteger(value) || value === undefined || value <= 0) {
    return 1;
  }

  return value;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

async function resolveStoreId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  storeId?: string,
): Promise<string | null> {
  const trimmedStoreId = storeId?.trim();

  if (trimmedStoreId) {
    return trimmedStoreId;
  }

  const { data, error } = await supabase
    .from("stores")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

export async function createGameDraft(
  input: CreateGameDraftInput,
): Promise<CreateGameDraftResult> {
  try {
    const supabase = await createSupabaseServerClient();

    const storeId = await resolveStoreId(supabase, input.storeId);

    if (!storeId) {
      return {
        ok: false,
        error: "无法创建牌局草稿：缺少 store_id，且 stores 表中没有可用门店。",
      };
    }

    const gameCount = normalizeGameCount(input.gameCount);

    const { data, error } = await supabase
      .from("games")
      .insert({
        store_id: storeId,
        game_count: gameCount,
        status: "created",
      })
      .select("id, created_at, store_id, game_count, status")
      .single();

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return {
      ok: true,
      game: data as GameDraft,
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}

export async function listRecentGameDrafts(): Promise<GameDraft[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("games")
    .select("id, created_at, store_id, game_count, status")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as GameDraft[];
}
