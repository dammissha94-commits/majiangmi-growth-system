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

export type SignUpForCampaignInput = {
  campaign_id: string;
  user_id: string;
};

export type SignUpForCampaignResult = {
  campaign: Pick<Campaign, "name"> | null;
  participant: CampaignParticipant | null;
  status: "already_signed_up" | "signed_up";
  user: Pick<User, "display_name"> | null;
};

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

export async function listEnrollingCampaignsByStore(
  storeId: string,
): Promise<Campaign[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("store_id", storeId)
    .in("status", ["published", "enrolling", "running"])
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(
      `list_enrolling_campaigns_by_store_failed: ${error.message}`,
    );
  }

  return (data ?? []) as Campaign[];
}

export async function signUpForCampaign(
  input: SignUpForCampaignInput,
): Promise<SignUpForCampaignResult> {
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("campaign_participants")
    .select("*")
    .eq("campaign_id", input.campaign_id)
    .eq("user_id", input.user_id)
    .neq("status", "cancelled")
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(`sign_up_for_campaign_failed: ${existingError.message}`);
  }

  const campaign = await getCampaignNameById(input.campaign_id);
  const user = await getUserNameForCampaign(input.user_id);

  if (existing) {
    return {
      campaign,
      participant: existing as CampaignParticipant,
      status: "already_signed_up",
      user,
    };
  }

  const { data, error } = await supabase
    .from("campaign_participants")
    .insert({
      campaign_id: input.campaign_id,
      signed_up_at: new Date().toISOString(),
      status: "signed_up",
      user_id: input.user_id,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`sign_up_for_campaign_failed: ${error.message}`);
  }

  return {
    campaign,
    participant: data,
    status: "signed_up",
    user,
  };
}

async function getCampaignNameById(
  campaignId: string,
): Promise<Pick<Campaign, "name"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("name")
    .eq("id", campaignId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`sign_up_for_campaign_failed: ${error.message}`);
  }

  return data as Pick<Campaign, "name"> | null;
}

async function getUserNameForCampaign(
  userId: string,
): Promise<Pick<User, "display_name"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`sign_up_for_campaign_failed: ${error.message}`);
  }

  return data as Pick<User, "display_name"> | null;
}

export type UserCampaignParticipationWithCampaign = CampaignParticipant & {
  campaign: Pick<
    Campaign,
    "campaign_type" | "ends_at" | "name" | "starts_at" | "status"
  > | null;
};

export async function listUserCampaignParticipationsWithCampaign(
  userId: string,
): Promise<UserCampaignParticipationWithCampaign[]> {
  const supabase = await createClient();
  const { data: participants, error: participantError } = await supabase
    .from("campaign_participants")
    .select("*")
    .eq("user_id", userId)
    .order("signed_up_at", { ascending: false });

  if (participantError) {
    throw new Error(
      `list_user_campaign_participations_with_campaign_failed: ${participantError.message}`,
    );
  }

  const participantRows = (participants ?? []) as CampaignParticipant[];

  if (participantRows.length === 0) {
    return [];
  }

  const campaignIds = Array.from(
    new Set(participantRows.map((p) => p.campaign_id)),
  );
  const { data: campaigns, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, name, campaign_type, starts_at, ends_at, status")
    .in("id", campaignIds);

  if (campaignError) {
    throw new Error(
      `list_user_campaign_participations_with_campaign_failed: ${campaignError.message}`,
    );
  }

  const campaignsById = new Map(
    (
      (campaigns ?? []) as Pick<
        Campaign,
        "id" | "name" | "campaign_type" | "starts_at" | "ends_at" | "status"
      >[]
    ).map((c) => [c.id, c]),
  );

  return participantRows.map((p) => ({
    ...p,
    campaign: campaignsById.get(p.campaign_id) ?? null,
  }));
}

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
