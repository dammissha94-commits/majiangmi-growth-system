export interface Referral {
  id: string;
  created_at: string;
  updated_at: string;
  store_id: string;
  referrer_user_id: string;
  referred_user_id: string;
  circle_id: string | null;
  referral_source: string;
  accepted_at: string | null;
}

export interface ReferralInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id: string;
  referrer_user_id: string;
  referred_user_id: string;
  circle_id?: string | null;
  referral_source?: string;
  accepted_at?: string | null;
}

export interface ReferralUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id?: string;
  referrer_user_id?: string;
  referred_user_id?: string;
  circle_id?: string | null;
  referral_source?: string;
  accepted_at?: string | null;
}
