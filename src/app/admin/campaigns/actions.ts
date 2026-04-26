"use server";

import { redirect } from "next/navigation";

import { updateCampaignParticipantStatus } from "@/lib/services/campaign_service";

export async function markParticipantArrivedAction(
  formData: FormData,
): Promise<void> {
  const participantId = getRequiredFormValue(formData, "participant_id");
  const campaignName = getRequiredFormValue(formData, "campaign_name");
  const userName = getRequiredFormValue(formData, "user_name");

  try {
    await updateCampaignParticipantStatus(participantId, "arrived");
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(`/admin/campaigns?arrived_error=${encodeURIComponent(message)}`);
  }

  const searchParams = new URLSearchParams({
    arrived_campaign: campaignName,
    arrived_status: "arrived",
    arrived_user: userName,
  });

  redirect(`/admin/campaigns?${searchParams.toString()}`);
}

function getRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`mark_participant_arrived_failed: ${key}_required`);
  }

  return value;
}
