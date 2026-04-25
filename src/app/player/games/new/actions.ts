"use server";

import { redirect } from "next/navigation";

import {
  addFourParticipantsFromCircle,
  createGameDraft,
  saveEntertainmentResults,
} from "@/lib/services/game_service";

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

export async function addFourParticipantsAction(
  formData: FormData,
): Promise<void> {
  let result: Awaited<ReturnType<typeof addFourParticipantsFromCircle>>;

  try {
    result = await addFourParticipantsFromCircle(
      getRequiredFormValue(formData, "game_id"),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(`/player/games/new?participant_error=${encodeURIComponent(message)}`);
  }

  const searchParams = new URLSearchParams({
    game_id: result.game_id,
    participant_status: result.status,
  });

  result.participants.slice(0, 4).forEach((participant) => {
    searchParams.set(
      `seat_${participant.seat_no}`,
      participant.user?.display_name ?? "未命名用户",
    );
  });

  redirect(`/player/games/new?${searchParams.toString()}`);
}

export async function saveEntertainmentResultsAction(
  formData: FormData,
): Promise<void> {
  let result: Awaited<ReturnType<typeof saveEntertainmentResults>>;

  try {
    const gameId = getRequiredFormValue(
      formData,
      "game_id",
      "save_entertainment_results_failed",
    );
    const mvpSeat = getRequiredFormValue(
      formData,
      "mvp_seat",
      "save_entertainment_results_failed",
    );

    result = await saveEntertainmentResults({
      game_id: gameId,
      results: [1, 2, 3, 4].map((seatNo) => ({
        entertainment_score: getRequiredNumberValue(
          formData,
          `entertainment_score_${seatNo}`,
          "save_entertainment_results_failed",
        ),
        is_mvp: String(seatNo) === mvpSeat,
        note: getOptionalFormValue(formData, `note_${seatNo}`),
        participant_id: getRequiredFormValue(
          formData,
          `participant_id_${seatNo}`,
          "save_entertainment_results_failed",
        ),
        rank: getRequiredNumberValue(
          formData,
          `rank_${seatNo}`,
          "save_entertainment_results_failed",
        ),
        user_id: getRequiredFormValue(
          formData,
          `user_id_${seatNo}`,
          "save_entertainment_results_failed",
        ),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(`/player/games/new?result_error=${encodeURIComponent(message)}`);
  }

  const searchParams = new URLSearchParams({
    game_id: result.game_id,
    result_status: result.status,
  });
  const mvpResult = result.results.find((gameResult) => gameResult.is_mvp);

  if (mvpResult) {
    searchParams.set(
      "mvp_player",
      mvpResult.user?.display_name ?? "未命名用户",
    );
  }

  result.results.slice(0, 4).forEach((gameResult, index) => {
    const rowNumber = index + 1;
    searchParams.set(
      `result_player_${rowNumber}`,
      gameResult.user?.display_name ?? "未命名用户",
    );
    searchParams.set(`result_rank_${rowNumber}`, String(gameResult.rank));
    searchParams.set(
      `result_score_${rowNumber}`,
      String(gameResult.entertainment_score),
    );
  });

  redirect(`/player/games/new?${searchParams.toString()}`);
}

function getRequiredFormValue(
  formData: FormData,
  key: string,
  errorPrefix = "create_game_draft_failed",
): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${errorPrefix}: ${key}_required`);
  }

  return value;
}

function getRequiredNumberValue(
  formData: FormData,
  key: string,
  errorPrefix: string,
): number {
  const value = Number(getRequiredFormValue(formData, key, errorPrefix));

  if (!Number.isFinite(value)) {
    throw new Error(`${errorPrefix}: ${key}_invalid`);
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
