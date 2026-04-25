import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  Coupon,
  CouponInsert,
  CouponRedemption,
  CouponRedemptionInsert,
  User,
} from "@/types/domain";

export type CouponRedemptionWithUser = CouponRedemption & {
  user: Pick<User, "display_name"> | null;
};

export type CouponWithRedemptions = Coupon & {
  redemptions: CouponRedemptionWithUser[];
};

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

export async function listCouponsWithRedemptionsByStore(
  storeId: string,
): Promise<CouponWithRedemptions[]> {
  const supabase = await createClient();
  const { data: coupons, error: couponError } = await supabase
    .from("coupons")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: true });

  if (couponError) {
    throw new Error(
      `list_coupons_with_redemptions_by_store_failed: ${couponError.message}`,
    );
  }

  const couponRows = (coupons ?? []) as Coupon[];

  if (couponRows.length === 0) {
    return [];
  }

  const couponIds = couponRows.map((coupon) => coupon.id);
  const { data: redemptions, error: redemptionError } = await supabase
    .from("coupon_redemptions")
    .select("*")
    .eq("store_id", storeId)
    .in("coupon_id", couponIds)
    .order("created_at", { ascending: true });

  if (redemptionError) {
    throw new Error(
      `list_coupons_with_redemptions_by_store_failed: ${redemptionError.message}`,
    );
  }

  const redemptionRows = (redemptions ?? []) as CouponRedemption[];
  const userIds = Array.from(
    new Set(redemptionRows.map((redemption) => redemption.user_id)),
  );

  const { data: users, error: userError } =
    userIds.length > 0
      ? await supabase
          .from("users")
          .select("id, display_name")
          .in("id", userIds)
      : { data: [], error: null };

  if (userError) {
    throw new Error(
      `list_coupons_with_redemptions_by_store_failed: ${userError.message}`,
    );
  }

  const usersById = new Map(
    ((users ?? []) as Pick<User, "id" | "display_name">[]).map((user) => [
      user.id,
      user,
    ]),
  );

  return couponRows.map((coupon) => ({
    ...coupon,
    redemptions: redemptionRows
      .filter((redemption) => redemption.coupon_id === coupon.id)
      .map((redemption) => ({
        ...redemption,
        user: usersById.get(redemption.user_id) ?? null,
      })),
  }));
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
