import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  Circle,
  Reservation,
  ReservationInsert,
  ReservationStatus,
  Room,
  User,
} from "@/types/domain";

export type ReservationWithDetails = Reservation & {
  circle: Pick<Circle, "name"> | null;
  room: Pick<Room, "name"> | null;
  user: Pick<User, "display_name"> | null;
};

export type ReservationDraftInput = {
  circle_id: string | null;
  end_time: string;
  reservation_date: string;
  room_id: string;
  start_time: string;
  store_id: string;
  user_id: string;
};

export type ReservationDraftUser = Pick<User, "display_name" | "id">;

export async function listReservationsByStore(
  store_id: string,
): Promise<Reservation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("store_id", store_id)
    .order("reservation_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`list_reservations_by_store_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function listReservationDraftUsers(): Promise<
  ReservationDraftUser[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, display_name")
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`list_reservation_draft_users_failed: ${error.message}`);
  }

  return (data ?? []) as ReservationDraftUser[];
}

export async function listReservationsWithDetailsByStore(
  storeId: string,
): Promise<ReservationWithDetails[]> {
  const supabase = await createClient();
  const { data: reservations, error: reservationError } = await supabase
    .from("reservations")
    .select("*")
    .eq("store_id", storeId)
    .order("reservation_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (reservationError) {
    throw new Error(
      `list_reservations_with_details_by_store_failed: ${reservationError.message}`,
    );
  }

  const reservationRows = (reservations ?? []) as Reservation[];

  if (reservationRows.length === 0) {
    return [];
  }

  const roomIds = Array.from(
    new Set(reservationRows.map((reservation) => reservation.room_id)),
  );
  const circleIds = Array.from(
    new Set(
      reservationRows
        .map((reservation) => reservation.circle_id)
        .filter((circleId): circleId is string => Boolean(circleId)),
    ),
  );
  const userIds = Array.from(
    new Set(reservationRows.map((reservation) => reservation.user_id)),
  );

  const [
    { data: rooms, error: roomError },
    { data: circles, error: circleError },
    { data: users, error: userError },
  ] = await Promise.all([
    supabase.from("rooms").select("id, name").in("id", roomIds),
    circleIds.length > 0
      ? supabase.from("circles").select("id, name").in("id", circleIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("users").select("id, display_name").in("id", userIds),
  ]);

  if (roomError) {
    throw new Error(
      `list_reservations_with_details_by_store_failed: ${roomError.message}`,
    );
  }

  if (circleError) {
    throw new Error(
      `list_reservations_with_details_by_store_failed: ${circleError.message}`,
    );
  }

  if (userError) {
    throw new Error(
      `list_reservations_with_details_by_store_failed: ${userError.message}`,
    );
  }

  const roomsById = new Map(
    ((rooms ?? []) as Pick<Room, "id" | "name">[]).map((room) => [
      room.id,
      room,
    ]),
  );
  const circlesById = new Map(
    ((circles ?? []) as Pick<Circle, "id" | "name">[]).map((circle) => [
      circle.id,
      circle,
    ]),
  );
  const usersById = new Map(
    ((users ?? []) as Pick<User, "id" | "display_name">[]).map((user) => [
      user.id,
      user,
    ]),
  );

  return reservationRows.map((reservation) => ({
    ...reservation,
    circle: reservation.circle_id
      ? (circlesById.get(reservation.circle_id) ?? null)
      : null,
    room: roomsById.get(reservation.room_id) ?? null,
    user: usersById.get(reservation.user_id) ?? null,
  }));
}

export async function listUserReservationsWithDetails(
  userId: string,
  storeId: string,
): Promise<ReservationWithDetails[]> {
  const supabase = await createClient();
  const { data: reservations, error: reservationError } = await supabase
    .from("reservations")
    .select("*")
    .eq("user_id", userId)
    .eq("store_id", storeId)
    .order("reservation_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (reservationError) {
    throw new Error(
      `list_user_reservations_with_details_failed: ${reservationError.message}`,
    );
  }

  const reservationRows = (reservations ?? []) as Reservation[];

  if (reservationRows.length === 0) {
    return [];
  }

  const roomIds = Array.from(
    new Set(reservationRows.map((r) => r.room_id)),
  );
  const circleIds = Array.from(
    new Set(
      reservationRows
        .map((r) => r.circle_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const [
    { data: rooms, error: roomError },
    { data: circles, error: circleError },
    { data: users, error: userError },
  ] = await Promise.all([
    supabase.from("rooms").select("id, name").in("id", roomIds),
    circleIds.length > 0
      ? supabase.from("circles").select("id, name").in("id", circleIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("users")
      .select("id, display_name")
      .eq("id", userId)
      .limit(1),
  ]);

  if (roomError) {
    throw new Error(
      `list_user_reservations_with_details_failed: ${roomError.message}`,
    );
  }

  if (circleError) {
    throw new Error(
      `list_user_reservations_with_details_failed: ${circleError.message}`,
    );
  }

  if (userError) {
    throw new Error(
      `list_user_reservations_with_details_failed: ${userError.message}`,
    );
  }

  const roomsById = new Map(
    ((rooms ?? []) as Pick<Room, "id" | "name">[]).map((r) => [r.id, r]),
  );
  const circlesById = new Map(
    ((circles ?? []) as Pick<Circle, "id" | "name">[]).map((c) => [c.id, c]),
  );
  const usersById = new Map(
    ((users ?? []) as Pick<User, "id" | "display_name">[]).map((u) => [
      u.id,
      u,
    ]),
  );

  return reservationRows.map((r) => ({
    ...r,
    circle: r.circle_id ? (circlesById.get(r.circle_id) ?? null) : null,
    room: roomsById.get(r.room_id) ?? null,
    user: usersById.get(r.user_id) ?? null,
  }));
}

export async function createReservation(
  input: ReservationInsert,
): Promise<Reservation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`create_reservation_failed: ${error.message}`);
  }

  return data;
}

export async function createReservationDraft(
  input: ReservationDraftInput,
): Promise<Reservation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      circle_id: input.circle_id,
      end_time: input.end_time,
      reservation_date: input.reservation_date,
      room_id: input.room_id,
      source: "player",
      start_time: input.start_time,
      status: "pending",
      store_id: input.store_id,
      user_id: input.user_id,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`create_reservation_draft_failed: ${error.message}`);
  }

  return data;
}

export async function updateReservationStatus(
  reservation_id: string,
  status: ReservationStatus,
): Promise<Reservation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", reservation_id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`update_reservation_status_failed: ${error.message}`);
  }

  return data;
}
