export type CouponType =
  | "store_service"
  | "time_slot"
  | "tea"
  | "snack"
  | "campaign";

export type CouponStatus = "draft" | "active" | "expired" | "disabled";

export type CouponRedemptionStatus =
  | "claimed"
  | "used"
  | "expired"
  | "cancelled";

export interface Coupon {
  id: string;
  created_at: string;
  updated_at: string;
  store_id: string;
  name: string;
  coupon_type: CouponType;
  description: string | null;
  valid_from: string | null;
  valid_to: string | null;
  total_quantity: number | null;
  status: CouponStatus;
}

export interface CouponInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id: string;
  name: string;
  coupon_type: CouponType;
  description?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  total_quantity?: number | null;
  status?: CouponStatus;
}

export interface CouponUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  store_id?: string;
  name?: string;
  coupon_type?: CouponType;
  description?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  total_quantity?: number | null;
  status?: CouponStatus;
}

export interface CouponRedemption {
  id: string;
  created_at: string;
  updated_at: string;
  coupon_id: string;
  user_id: string;
  store_id: string;
  reservation_id: string | null;
  claimed_at: string;
  used_at: string | null;
  status: CouponRedemptionStatus;
}

export interface CouponRedemptionInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  coupon_id: string;
  user_id: string;
  store_id: string;
  reservation_id?: string | null;
  claimed_at?: string;
  used_at?: string | null;
  status?: CouponRedemptionStatus;
}

export interface CouponRedemptionUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  coupon_id?: string;
  user_id?: string;
  store_id?: string;
  reservation_id?: string | null;
  claimed_at?: string;
  used_at?: string | null;
  status?: CouponRedemptionStatus;
}
