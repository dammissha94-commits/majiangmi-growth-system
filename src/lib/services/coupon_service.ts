import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  Coupon,
  CouponInsert,
  CouponRedemption,
  CouponRedemptionInsert,
} from "@/types/domain";

export async function listCouponsByStore(
  store_id: string,
): Promise<Coupon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("store_id", store_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`list_coupons_by_store_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function listUserCoupons(
  user_id: string,
): Promise<CouponRedemption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupon_redemptions")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`list_user_coupons_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function createCoupon(input: CouponInsert): Promise<Coupon> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`create_coupon_failed: ${error.message}`);
  }

  return data;
}

export async function claimCoupon(
  input: CouponRedemptionInsert,
): Promise<CouponRedemption> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupon_redemptions")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`claim_coupon_failed: ${error.message}`);
  }

  return data;
}

export async function redeemCoupon(
  coupon_redemption_id: string,
): Promise<CouponRedemption> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupon_redemptions")
    .update({ status: "used", used_at: new Date().toISOString() })
    .eq("id", coupon_redemption_id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`redeem_coupon_failed: ${error.message}`);
  }

  return data;
}
