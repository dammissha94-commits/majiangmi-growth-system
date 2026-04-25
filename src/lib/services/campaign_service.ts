import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  Campaign,
  CampaignInsert,
  CampaignParticipant,
  CampaignParticipantInsert,
  CampaignParticipantStatus,
  Circle,
  Reservation,
  User,
} from "@/types/domain";

export type CampaignParticipantWithDetails = CampaignParticipant & {
  circle: Pick<Circle, "name"> | null;
  reservation: Pick<
    Reservation,
    "reservation_date" | "start_time" | "end_time"
  > | null;
  user: Pick<User, "display_name"> | null;
};

export type CampaignWithParticipants = Campaign & {
  participants: CampaignParticipantWithDetails[];
};

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

export async function listCampaignsWithParticipantsByStore(
  storeId: string,
): Promise<CampaignWithParticipants[]> {
  const supabase = await createClient();
  const { data: campaigns, error: campaignError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: true });

  if (campaignError) {
    throw new Error(
      `list_campaigns_with_participants_by_store_failed: ${campaignError.message}`,
    );
  }

  const campaignRows = (campaigns ?? []) as Campaign[];

  if (campaignRows.length === 0) {
    return [];
  }

  const campaignIds = campaignRows.map((campaign) => campaign.id);
  const { data: participants, error: participantError } = await supabase
    .from("campaign_participants")
    .select("*")
    .in("campaign_id", campaignIds)
    .order("created_at", { ascending: true });

  if (participantError) {
    throw new Error(
      `list_campaigns_with_participants_by_store_failed: ${participantError.message}`,
    );
  }

  const participantRows = (participants ?? []) as CampaignParticipant[];
  const userIds = Array.from(
    new Set(participantRows.map((participant) => participant.user_id)),
  );
  const circleIds = Array.from(
    new Set(
      participantRows
        .map((participant) => participant.circle_id)
        .filter((circleId): circleId is string => Boolean(circleId)),
    ),
  );
  const reservationIds = Array.from(
    new Set(
      participantRows
        .map((participant) => participant.reservation_id)
        .filter((reservationId): reservationId is string =>
          Boolean(reservationId),
        ),
    ),
  );

  const [
    { data: users, error: userError },
    { data: circles, error: circleError },
    { data: reservations, error: reservationError },
  ] = await Promise.all([
    userIds.length > 0
      ? supabase.from("users").select("id, display_name").in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
    circleIds.length > 0
      ? supabase.from("circles").select("id, name").in("id", circleIds)
      : Promise.resolve({ data: [], error: null }),
    reservationIds.length > 0
      ? supabase
          .from("reservations")
          .select("id, reservation_date, start_time, end_time")
          .in("id", reservationIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (userError) {
    throw new Error(
      `list_campaigns_with_participants_by_store_failed: ${userError.message}`,
    );
  }

  if (circleError) {
    throw new Error(
      `list_campaigns_with_participants_by_store_failed: ${circleError.message}`,
    );
  }

  if (reservationError) {
    throw new Error(
      `list_campaigns_with_participants_by_store_failed: ${reservationError.message}`,
    );
  }

  const usersById = new Map(
    ((users ?? []) as Pick<User, "id" | "display_name">[]).map((user) => [
      user.id,
      user,
    ]),
  );
  const circlesById = new Map(
    ((circles ?? []) as Pick<Circle, "id" | "name">[]).map((circle) => [
      circle.id,
      circle,
    ]),
  );
  const reservationsById = new Map(
    (
      (reservations ?? []) as Pick<
        Reservation,
        "id" | "reservation_date" | "start_time" | "end_time"
      >[]
    ).map((reservation) => [reservation.id, reservation]),
  );

  return campaignRows.map((campaign) => ({
    ...campaign,
    participants: participantRows
      .filter((participant) => participant.campaign_id === campaign.id)
      .map((participant) => ({
        ...participant,
        circle: participant.circle_id
          ? (circlesById.get(participant.circle_id) ?? null)
          : null,
        reservation: participant.reservation_id
          ? (reservationsById.get(participant.reservation_id) ?? null)
          : null,
        user: usersById.get(participant.user_id) ?? null,
      })),
  }));
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
