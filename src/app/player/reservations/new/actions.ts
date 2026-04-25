"use server";

import { redirect } from "next/navigation";

import { createReservationDraft } from "@/lib/services/reservation_service";

export async function createReservationDraftAction(
  formData: FormData,
): Promise<void> {
  let createdReservation: Awaited<ReturnType<typeof createReservationDraft>>;

  try {
    createdReservation = await createReservationDraft({
      circle_id: getOptionalFormValue(formData, "circle_id"),
      end_time: getRequiredFormValue(formData, "end_time"),
      reservation_date: getRequiredFormValue(formData, "reservation_date"),
      room_id: getRequiredFormValue(formData, "room_id"),
      start_time: getRequiredFormValue(formData, "start_time"),
      store_id: getRequiredFormValue(formData, "store_id"),
      user_id: getRequiredFormValue(formData, "user_id"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(
      `/player/reservations/new?error=${encodeURIComponent(message)}`,
    );
  }

  redirect(
    `/player/reservations/new?created=1&reservation_date=${encodeURIComponent(
      createdReservation.reservation_date,
    )}&start_time=${encodeURIComponent(
      createdReservation.start_time,
    )}&end_time=${encodeURIComponent(
      createdReservation.end_time,
    )}&status=${encodeURIComponent(createdReservation.status)}`,
  );
}

function getRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`create_reservation_draft_failed: ${key}_required`);
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
