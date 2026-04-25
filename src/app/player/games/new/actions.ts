"use server";

import { revalidatePath } from "next/cache";

import { createGameDraft } from "@/lib/services/game_service";

export async function createGameDraftAction(formData: FormData): Promise<void> {
  const storeId = String(formData.get("store_id") ?? "").trim();
  const gameCountRaw = String(formData.get("game_count") ?? "1").trim();
  const gameCount = Number(gameCountRaw);

  const result = await createGameDraft({
    storeId: storeId || undefined,
    gameCount,
  });

  if (!result.ok) {
    throw new Error(result.error);
  }

  revalidatePath("/player/games/new");
}
