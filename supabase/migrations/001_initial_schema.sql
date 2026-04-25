create table stores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  brand_name text,
  address text,
  contact_phone text,
  opening_hours text,
  status text not null default 'active' check (status in ('active', 'inactive'))
);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  store_id uuid not null references stores(id),
  name text not null,
  capacity integer not null default 4 check (capacity > 0),
  floor_label text,
  status text not null default 'active' check (status in ('active', 'inactive'))
);

create table users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  display_name text not null,
  phone text,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'inactive'))
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  store_id uuid not null references stores(id),
  user_id uuid not null references users(id),
  member_level text not null default 'regular',
  visit_count integer not null default 0 check (visit_count >= 0),
  game_count integer not null default 0 check (game_count >= 0),
  last_visit_at timestamptz,
  tags text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'inactive')),
  unique (store_id, user_id)
);

create table circles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  store_id uuid not null references stores(id),
  owner_user_id uuid not null references users(id),
  name text not null,
  description text,
  member_count integer not null default 1 check (member_count >= 0),
  game_count integer not null default 0 check (game_count >= 0),
  last_active_at timestamptz,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived'))
);

create table circle_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  circle_id uuid not null references circles(id),
  user_id uuid not null references users(id),
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  unique (circle_id, user_id)
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  store_id uuid not null references stores(id),
  room_id uuid not null references rooms(id),
  circle_id uuid references circles(id),
  user_id uuid not null references users(id),
  reservation_date date not null,
  start_time time not null,
  end_time time not null,
  source text not null default 'player',
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'arrived', 'playing', 'completed', 'cancelled', 'no_show')
  )
);

create table games (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  store_id uuid not null references stores(id),
  room_id uuid references rooms(id),
  circle_id uuid references circles(id),
  reservation_id uuid references reservations(id),
  started_at timestamptz,
  ended_at timestamptz,
  game_count integer not null default 1 check (game_count > 0),
  status text not null default 'created' check (
    status in ('created', 'waiting_players', 'playing', 'result_pending', 'completed', 'card_generated', 'shared', 'archived')
  )
);

create table game_participants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  game_id uuid not null references games(id),
  user_id uuid not null references users(id),
  seat_no integer not null check (seat_no > 0),
  joined_at timestamptz not null default now(),
  unique (game_id, user_id),
  unique (game_id, seat_no)
);

create table game_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  game_id uuid not null references games(id),
  participant_id uuid not null references game_participants(id),
  user_id uuid not null references users(id),
  entertainment_score integer not null default 0,
  rank integer not null check (rank > 0),
  is_mvp boolean not null default false,
  note text,
  unique (game_id, user_id),
  unique (game_id, rank)
);

create table result_cards (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  game_id uuid not null references games(id),
  store_id uuid not null references stores(id),
  circle_id uuid references circles(id),
  card_title text not null,
  card_subtitle text,
  share_count integer not null default 0 check (share_count >= 0),
  generated_at timestamptz not null default now()
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  store_id uuid not null references stores(id),
  name text not null,
  coupon_type text not null check (coupon_type in ('store_service', 'time_slot', 'tea', 'snack', 'campaign')),
  description text,
  valid_from timestamptz,
  valid_to timestamptz,
  total_quantity integer check (total_quantity is null or total_quantity >= 0),
  status text not null default 'draft' check (status in ('draft', 'active', 'expired', 'disabled'))
);

create table coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  coupon_id uuid not null references coupons(id),
  user_id uuid not null references users(id),
  store_id uuid not null references stores(id),
  reservation_id uuid references reservations(id),
  claimed_at timestamptz not null default now(),
  used_at timestamptz,
  status text not null default 'claimed' check (status in ('claimed', 'used', 'expired', 'cancelled'))
);

create table referrals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  store_id uuid not null references stores(id),
  referrer_user_id uuid not null references users(id),
  referred_user_id uuid not null references users(id),
  circle_id uuid references circles(id),
  referral_source text not null default 'result_card',
  accepted_at timestamptz,
  unique (store_id, referrer_user_id, referred_user_id)
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  store_id uuid not null references stores(id),
  name text not null,
  campaign_type text not null check (
    campaign_type in ('friend_game', 'weekday_activation', 'member_referral', 'circle_board', 'birthday_game')
  ),
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft' check (
    status in ('draft', 'published', 'enrolling', 'running', 'completed', 'reviewed', 'cancelled')
  )
);

create table campaign_participants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  campaign_id uuid not null references campaigns(id),
  user_id uuid not null references users(id),
  circle_id uuid references circles(id),
  reservation_id uuid references reservations(id),
  signed_up_at timestamptz not null default now(),
  status text not null default 'signed_up' check (
    status in ('signed_up', 'arrived', 'completed', 'cancelled', 'no_show')
  ),
  unique (campaign_id, user_id)
);

create index idx_rooms_store_id on rooms(store_id);
create index idx_rooms_status on rooms(status);

create index idx_users_phone on users(phone);
create index idx_users_status on users(status);

create index idx_memberships_store_id on memberships(store_id);
create index idx_memberships_user_id on memberships(user_id);
create index idx_memberships_status on memberships(status);
create index idx_memberships_last_visit_at on memberships(last_visit_at);

create index idx_circles_store_id on circles(store_id);
create index idx_circles_owner_user_id on circles(owner_user_id);
create index idx_circles_status on circles(status);
create index idx_circles_last_active_at on circles(last_active_at);

create index idx_circle_members_circle_id on circle_members(circle_id);
create index idx_circle_members_user_id on circle_members(user_id);

create index idx_reservations_store_id on reservations(store_id);
create index idx_reservations_room_id on reservations(room_id);
create index idx_reservations_circle_id on reservations(circle_id);
create index idx_reservations_user_id on reservations(user_id);
create index idx_reservations_date_status on reservations(reservation_date, status);

create index idx_games_store_id on games(store_id);
create index idx_games_room_id on games(room_id);
create index idx_games_circle_id on games(circle_id);
create index idx_games_reservation_id on games(reservation_id);
create index idx_games_status on games(status);
create index idx_games_started_at on games(started_at);

create index idx_game_participants_game_id on game_participants(game_id);
create index idx_game_participants_user_id on game_participants(user_id);

create index idx_game_results_game_id on game_results(game_id);
create index idx_game_results_user_id on game_results(user_id);
create index idx_game_results_rank on game_results(rank);

create index idx_result_cards_game_id on result_cards(game_id);
create index idx_result_cards_store_id on result_cards(store_id);
create index idx_result_cards_circle_id on result_cards(circle_id);
create index idx_result_cards_generated_at on result_cards(generated_at);

create index idx_coupons_store_id on coupons(store_id);
create index idx_coupons_type on coupons(coupon_type);
create index idx_coupons_status on coupons(status);
create index idx_coupons_valid_to on coupons(valid_to);

create index idx_coupon_redemptions_coupon_id on coupon_redemptions(coupon_id);
create index idx_coupon_redemptions_user_id on coupon_redemptions(user_id);
create index idx_coupon_redemptions_store_id on coupon_redemptions(store_id);
create index idx_coupon_redemptions_status on coupon_redemptions(status);

create index idx_referrals_store_id on referrals(store_id);
create index idx_referrals_referrer_user_id on referrals(referrer_user_id);
create index idx_referrals_referred_user_id on referrals(referred_user_id);
create index idx_referrals_circle_id on referrals(circle_id);

create index idx_campaigns_store_id on campaigns(store_id);
create index idx_campaigns_type on campaigns(campaign_type);
create index idx_campaigns_status on campaigns(status);
create index idx_campaigns_starts_at on campaigns(starts_at);

create index idx_campaign_participants_campaign_id on campaign_participants(campaign_id);
create index idx_campaign_participants_user_id on campaign_participants(user_id);
create index idx_campaign_participants_circle_id on campaign_participants(circle_id);
create index idx_campaign_participants_status on campaign_participants(status);
