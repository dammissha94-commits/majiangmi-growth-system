"use server";

import { redirect } from "next/navigation";

import { createGameDraft } from "@/lib/services/game_service";

export async function createGameDraftAction(formData: FormData): Promise<void> {
  let createdGame: Awaited<ReturnType<typeof createGameDraft>>;

  try {
    createdGame = await createGameDraft({
      circle_id: getOptionalFormValue(formData, "circle_id"),
      reservation_id: getOptionalFormValue(formData, "reservation_id"),
      room_id: getOptionalFormValue(formData, "room_id"),
      store_id: getRequiredFormValue(formData, "store_id"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(`/player/games/new?error=${encodeURIComponent(message)}`);
  }

  redirect(
    `/player/games/new?created=1&game_id=${encodeURIComponent(
      createdGame.id,
    )}&status=${encodeURIComponent(
      createdGame.status,
    )}&game_count=${encodeURIComponent(
      String(createdGame.game_count),
    )}&room_id=${encodeURIComponent(
      createdGame.room_id ?? "null",
    )}&circle_id=${encodeURIComponent(
      createdGame.circle_id ?? "null",
    )}&reservation_id=${encodeURIComponent(createdGame.reservation_id ?? "null")}`,
  );
}

function getRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`create_game_draft_failed: ${key}_required`);
  }

  return value;
}

function getOptionalFormValue(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value;
}
