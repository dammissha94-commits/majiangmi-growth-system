import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  Campaign,
  CampaignInsert,
  CampaignParticipant,
  CampaignParticipantInsert,
  CampaignParticipantStatus,
} from "@/types/domain";

export async function listCampaignsByStore(
  store_id: string,
): Promise<Campaign[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("store_id", store_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`list_campaigns_by_store_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function createCampaign(
  input: CampaignInsert,
): Promise<Campaign> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`create_campaign_failed: ${error.message}`);
  }

  return data;
}

export async function joinCampaign(
  input: CampaignParticipantInsert,
): Promise<CampaignParticipant> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaign_participants")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`join_campaign_failed: ${error.message}`);
  }

  return data;
}

export async function updateCampaignParticipantStatus(
  campaign_participant_id: string,
  status: CampaignParticipantStatus,
): Promise<CampaignParticipant> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaign_participants")
    .update({ status })
    .eq("id", campaign_participant_id)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `update_campaign_participant_status_failed: ${error.message}`,
    );
  }

  return data;
}
