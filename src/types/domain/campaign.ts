export type CampaignType =
  | "friend_game"
  | "weekday_activation"
  | "member_referral"
  | "circle_board"
  | "birthday_game";

export type CampaignStatus =
  | "draft"
  | "published"
  | "enrolling"
  | "running"
  | "completed"
  | "reviewed"
  | "cancelled";

export type CampaignParticipantStatus =
  | "signed_up"
  | "arrived"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Campaign {
  id: string;
  created_at: string;
  updated_at: string;
  store_id: string;
  name: string;
  campaign_type: CampaignType;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: CampaignStatus;
}

export interface CampaignInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id: string;
  name: string;
  campaign_type: CampaignType;
  description?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  status?: CampaignStatus;
}

export interface CampaignUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id?: string;
  name?: string;
  campaign_type?: CampaignType;
  description?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  status?: CampaignStatus;
}

export interface CampaignParticipant {
  id: string;
  created_at: string;
  updated_at: string;
  campaign_id: string;
  user_id: string;
  circle_id: string | null;
  reservation_id: string | null;
  signed_up_at: string;
  status: CampaignParticipantStatus;
}

export interface CampaignParticipantInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  campaign_id: string;
  user_id: string;
  circle_id?: string | null;
  reservation_id?: string | null;
  signed_up_at?: string;
  status?: CampaignParticipantStatus;
}

export interface CampaignParticipantUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  campaign_id?: string;
  user_id?: string;
  circle_id?: string | null;
  reservation_id?: string | null;
  signed_up_at?: string;
  status?: CampaignParticipantStatus;
}
