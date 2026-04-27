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

export type CouponClaimUser = Pick<User, "display_name" | "id">;

export type ClaimCouponForUserInput = {
  coupon_id: string;
  store_id: string;
  user_id: string;
};

export type ClaimCouponForUserResult = {
  coupon: Pick<Coupon, "name"> | null;
  redemption: CouponRedemption | null;
  status: "already_exists" | "claimed";
  user: Pick<User, "display_name"> | null;
};

export type ClaimedCouponRedemption = CouponRedemption & {
  coupon: Pick<Coupon, "name"> | null;
  user: Pick<User, "display_name"> | null;
};

export type RedeemCouponRedemptionResult = {
  coupon: Pick<Coupon, "name"> | null;
  redemption: CouponRedemption;
  status: "already_used" | "invalid_status" | "used";
  user: Pick<User, "display_name"> | null;
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

export async function listClaimedCouponRedemptionsByStore(
  storeId: string,
): Promise<ClaimedCouponRedemption[]> {
  const supabase = await createClient();
  const { data: redemptions, error: redemptionError } = await supabase
    .from("coupon_redemptions")
    .select("*")
    .eq("store_id", storeId)
    .eq("status", "claimed")
    .order("claimed_at", { ascending: true });

  if (redemptionError) {
    throw new Error(
      `list_claimed_coupon_redemptions_by_store_failed: ${redemptionError.message}`,
    );
  }

  const redemptionRows = (redemptions ?? []) as CouponRedemption[];

  if (redemptionRows.length === 0) {
    return [];
  }

  const couponIds = Array.from(
    new Set(redemptionRows.map((redemption) => redemption.coupon_id)),
  );
  const userIds = Array.from(
    new Set(redemptionRows.map((redemption) => redemption.user_id)),
  );

  const { data: coupons, error: couponError } = await supabase
    .from("coupons")
    .select("id, name")
    .in("id", couponIds);

  if (couponError) {
    throw new Error(
      `list_claimed_coupon_redemptions_by_store_failed: ${couponError.message}`,
    );
  }

  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id, display_name")
    .in("id", userIds);

  if (userError) {
    throw new Error(
      `list_claimed_coupon_redemptions_by_store_failed: ${userError.message}`,
    );
  }

  const couponsById = new Map(
    ((coupons ?? []) as Pick<Coupon, "id" | "name">[]).map((coupon) => [
      coupon.id,
      coupon,
    ]),
  );
  const usersById = new Map(
    ((users ?? []) as Pick<User, "display_name" | "id">[]).map((user) => [
      user.id,
      user,
    ]),
  );

  return redemptionRows.map((redemption) => ({
    ...redemption,
    coupon: couponsById.get(redemption.coupon_id) ?? null,
    user: usersById.get(redemption.user_id) ?? null,
  }));
}

export async function listCouponClaimUsers(): Promise<CouponClaimUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, display_name")
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`list_coupon_claim_users_failed: ${error.message}`);
  }

  return (data ?? []) as CouponClaimUser[];
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

export type UserCouponRedemptionWithCoupon = CouponRedemption & {
  coupon: Pick<Coupon, "coupon_type" | "name" | "valid_from" | "valid_to"> | null;
};

export async function listUserCouponRedemptionsWithCoupon(
  userId: string,
  storeId: string,
): Promise<UserCouponRedemptionWithCoupon[]> {
  const supabase = await createClient();
  const { data: redemptions, error: redemptionError } = await supabase
    .from("coupon_redemptions")
    .select("*")
    .eq("user_id", userId)
    .eq("store_id", storeId)
    .order("claimed_at", { ascending: false });

  if (redemptionError) {
    throw new Error(
      `list_user_coupon_redemptions_with_coupon_failed: ${redemptionError.message}`,
    );
  }

  const redemptionRows = (redemptions ?? []) as CouponRedemption[];

  if (redemptionRows.length === 0) {
    return [];
  }

  const couponIds = Array.from(
    new Set(redemptionRows.map((r) => r.coupon_id)),
  );
  const { data: coupons, error: couponError } = await supabase
    .from("coupons")
    .select("id, name, coupon_type, valid_from, valid_to")
    .in("id", couponIds);

  if (couponError) {
    throw new Error(
      `list_user_coupon_redemptions_with_coupon_failed: ${couponError.message}`,
    );
  }

  const couponsById = new Map(
    (
      (coupons ?? []) as Pick<
        Coupon,
        "id" | "name" | "coupon_type" | "valid_from" | "valid_to"
      >[]
    ).map((c) => [c.id, c]),
  );

  return redemptionRows.map((r) => ({
    ...r,
    coupon: couponsById.get(r.coupon_id) ?? null,
  }));
}

export async function findFirstActiveCouponByStore(
  storeId: string,
): Promise<Coupon | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("store_id", storeId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `find_first_active_coupon_by_store_failed: ${error.message}`,
    );
  }

  return data as Coupon | null;
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

export async function claimCouponForUser(
  input: ClaimCouponForUserInput,
): Promise<ClaimCouponForUserResult> {
  const supabase = await createClient();
  const { data: existingRedemption, error: existingError } = await supabase
    .from("coupon_redemptions")
    .select("*")
    .eq("coupon_id", input.coupon_id)
    .eq("user_id", input.user_id)
    .in("status", ["claimed", "used"])
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `claim_coupon_for_user_failed: ${existingError.message}`,
    );
  }

  const coupon = await getCouponNameForClaim(input.coupon_id);
  const user = await getUserNameForClaim(input.user_id);

  if (existingRedemption) {
    return {
      coupon,
      redemption: existingRedemption as CouponRedemption,
      status: "already_exists",
      user,
    };
  }

  const { data, error } = await supabase
    .from("coupon_redemptions")
    .insert({
      claimed_at: new Date().toISOString(),
      coupon_id: input.coupon_id,
      reservation_id: null,
      status: "claimed",
      store_id: input.store_id,
      used_at: null,
      user_id: input.user_id,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`claim_coupon_for_user_failed: ${error.message}`);
  }

  return {
    coupon,
    redemption: data,
    status: "claimed",
    user,
  };
}

export async function redeemCouponRedemption(
  redemptionId: string,
): Promise<RedeemCouponRedemptionResult> {
  const supabase = await createClient();
  const { data: existingRedemption, error: existingError } = await supabase
    .from("coupon_redemptions")
    .select("*")
    .eq("id", redemptionId)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `redeem_coupon_redemption_failed: ${existingError.message}`,
    );
  }

  if (!existingRedemption) {
    throw new Error("redeem_coupon_redemption_failed: redemption_not_found");
  }

  const redemption = existingRedemption as CouponRedemption;
  const coupon = await getCouponNameForRedemption(redemption.coupon_id);
  const user = await getUserNameForRedemption(redemption.user_id);

  if (redemption.status === "used") {
    return {
      coupon,
      redemption,
      status: "already_used",
      user,
    };
  }

  if (redemption.status !== "claimed") {
    return {
      coupon,
      redemption,
      status: "invalid_status",
      user,
    };
  }

  const usedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("coupon_redemptions")
    .update({
      status: "used",
      updated_at: usedAt,
      used_at: usedAt,
    })
    .eq("id", redemptionId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`redeem_coupon_redemption_failed: ${error.message}`);
  }

  return {
    coupon,
    redemption: data,
    status: "used",
    user,
  };
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

async function getCouponNameForClaim(
  couponId: string,
): Promise<Pick<Coupon, "name"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("name")
    .eq("id", couponId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`claim_coupon_for_user_failed: ${error.message}`);
  }

  return data as Pick<Coupon, "name"> | null;
}

async function getUserNameForClaim(
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
    throw new Error(`claim_coupon_for_user_failed: ${error.message}`);
  }

  return data as Pick<User, "display_name"> | null;
}

async function getCouponNameForRedemption(
  couponId: string,
): Promise<Pick<Coupon, "name"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("name")
    .eq("id", couponId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`redeem_coupon_redemption_failed: ${error.message}`);
  }

  return data as Pick<Coupon, "name"> | null;
}

async function getUserNameForRedemption(
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
    throw new Error(`redeem_coupon_redemption_failed: ${error.message}`);
  }

  return data as Pick<User, "display_name"> | null;
}
