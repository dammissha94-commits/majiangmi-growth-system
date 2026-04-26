"use server";

import { redirect } from "next/navigation";

import { incrementResultCardShareCount } from "@/lib/services/result_card_service";

export async function incrementShareCountAction(
  formData: FormData,
): Promise<void> {
  const resultCardId = getRequiredFormValue(formData, "result_card_id");
  let result: Awaited<ReturnType<typeof incrementResultCardShareCount>>;

  try {
    result = await incrementResultCardShareCount(resultCardId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(
      `/player/results/${resultCardId}?share_error=${encodeURIComponent(message)}`,
    );
  }

  redirect(
    `/player/results/${resultCardId}?shared=1&share_count=${encodeURIComponent(String(result.share_count))}`,
  );
}

function getRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`increment_share_count_failed: ${key}_required`);
  }

  return value;
}
