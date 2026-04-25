import Link from "next/link";
import type { ReactNode } from "react";

import {
  addFourParticipantsAction,
  createGameDraftAction,
  saveEntertainmentResultsAction,
} from "@/app/player/games/new/actions";
import { getFirstActiveStore } from "@/lib/services/dashboard_service";
import {
  listCirclesWithMembersByStore,
  type CircleWithDetails,
} from "@/lib/services/circle_service";
import {
  getLatestGameDraftByStore,
  getLatestGameReadyForResultsByStore,
  type GameReadyForResults,
  listRecentGameDrafts,
} from "@/lib/services/game_service";
import {
  listReservationsWithDetailsByStore,
  type ReservationWithDetails,
} from "@/lib/services/reservation_service";
import { listRoomsByStore } from "@/lib/services/room_service";
import type { Game, Room } from "@/types/domain";

export const dynamic = "force-dynamic";

type GamePageData = {
  circles: CircleWithDetails[];
  latest_game_draft: Game | null;
  latest_game_ready_for_results: GameReadyForResults | null;
  recent_games: Game[];
  reservations: ReservationWithDetails[];
  rooms: Room[];
  store_id: string;
  store_name: string;
};

type Metric = {
  label: string;
  suffix: string;
  value: number;
};

type NewGamePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const steps = [
  "选择熟人圈",
  "选择包厢",
  "关联预约记录",
  "创建牌局草稿",
  "后续添加参与玩家",
];

const defaultScores: Record<number, number> = {
  1: 86,
  2: 42,
  3: -18,
  4: -35,
};

export default async function NewGamePage({ searchParams }: NewGamePageProps) {
  const pageData = await loadGamePageData();
  const resolvedSearchParams = searchParams ? await searchParams : {};

  if (pageData.status === "empty") {
    return <GameShell>{renderNoStoreState()}</GameShell>;
  }

  const metrics = buildMetrics(pageData.data);
  const sortedCircles = sortRecommendedCircles(pageData.data.circles);
  const sortedRooms = sortRecommendedRooms(pageData.data.rooms);
  const successMessage = getSearchParam(resolvedSearchParams, "created");
  const errorMessage = getSearchParam(resolvedSearchParams, "error");
  const participantErrorMessage = getSearchParam(
    resolvedSearchParams,
    "participant_error",
  );
  const participantStatus = getSearchParam(
    resolvedSearchParams,
    "participant_status",
  );
  const resultErrorMessage = getSearchParam(resolvedSearchParams, "result_error");
  const resultStatus = getSearchParam(resolvedSearchParams, "result_status");
  const participantRows = buildParticipantRows(resolvedSearchParams);
  const resultRows = buildResultRows(resolvedSearchParams);
  const mvpPlayer = getSearchParam(resolvedSearchParams, "mvp_player");
  const createdGame = {
    circle_id: getSearchParam(resolvedSearchParams, "circle_id"),
    game_count: getSearchParam(resolvedSearchParams, "game_count"),
    game_id: getSearchParam(resolvedSearchParams, "game_id"),
    reservation_id: getSearchParam(resolvedSearchParams, "reservation_id"),
    room_id: getSearchParam(resolvedSearchParams, "room_id"),
    status: getSearchParam(resolvedSearchParams, "status"),
  };

  return (
    <GameShell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">快速开局</p>
        <h1 className="mt-3 text-3xl font-semibold">创建牌局草稿</h1>
        <p className="mt-3 text-xl font-semibold">{pageData.data.store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          当前仅创建牌局草稿，不会保存娱乐积分结果。
        </p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          当前步骤只添加参与玩家，不会保存娱乐积分结果。
        </p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          当前步骤只保存娱乐积分结果，不会生成战绩海报。
        </p>
        <p className="mt-4 rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4 text-sm text-[#f1dba5]">
          娱乐积分，仅作休闲记录。
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <article
            className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5"
            key={metric.label}
          >
            <p className="text-sm text-[#5d756d]">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold">
              {metric.value}
              <span className="ml-1 text-base font-medium text-[#5d756d]">
                {metric.suffix}
              </span>
            </p>
          </article>
        ))}
      </section>

      {successMessage ? (
        <section className="mt-6 rounded-3xl border border-[#b7892c] bg-[#fff8ea] p-5">
          <p className="text-sm font-semibold text-[#9b7428]">
            牌局草稿已创建
          </p>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-[#4d665e] md:grid-cols-2">
            <p>game id：{createdGame.game_id ?? "未返回"}</p>
            <p>status：{createdGame.status ?? "未返回"}</p>
            <p>game_count：{createdGame.game_count ?? "未返回"}</p>
            <p>room_id：{formatNullableId(createdGame.room_id)}</p>
            <p>circle_id：{formatNullableId(createdGame.circle_id)}</p>
            <p>reservation_id：{formatNullableId(createdGame.reservation_id)}</p>
          </div>
        </section>
      ) : null}

      {participantStatus ? (
        <section className="mt-6 rounded-3xl border border-[#b7892c] bg-[#fff8ea] p-5">
          <p className="text-sm font-semibold text-[#9b7428]">
            {participantStatus === "already_exists"
              ? "该牌局已添加参与玩家"
              : "4名参与玩家已添加"}
          </p>
          <p className="mt-3 text-sm leading-7 text-[#4d665e]">
            game_id：{getSearchParam(resolvedSearchParams, "game_id") ?? "未返回"}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {participantRows.map((participant) => (
              <div
                className="rounded-2xl bg-[#f7f1e6] p-4"
                key={participant.seat_no}
              >
                <p className="text-sm text-[#5d756d]">
                  seat_no {participant.seat_no}
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {participant.display_name}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {resultStatus ? (
        <section className="mt-6 rounded-3xl border border-[#b7892c] bg-[#fff8ea] p-5">
          <p className="text-sm font-semibold text-[#9b7428]">
            {resultStatus === "already_exists"
              ? "该牌局已保存娱乐积分结果"
              : "娱乐积分结果已保存"}
          </p>
          <p className="mt-3 text-sm leading-7 text-[#4d665e]">
            game_id：{getSearchParam(resolvedSearchParams, "game_id") ?? "未返回"}
          </p>
          <p className="mt-2 text-sm leading-7 text-[#4d665e]">
            MVP 玩家：{mvpPlayer ?? "暂无"}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {resultRows.map((result) => (
              <div
                className="rounded-2xl bg-[#f7f1e6] p-4"
                key={result.rank}
              >
                <p className="text-sm text-[#5d756d]">
                  {result.display_name}
                </p>
                <p className="mt-2 text-lg font-semibold">rank {result.rank}</p>
                <p className="mt-2 text-sm text-[#5d756d]">
                  entertainment_score：{result.entertainment_score}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="mt-6 rounded-3xl border border-[#b7892c] bg-[#fff8ea] p-5">
          <p className="text-sm font-semibold text-[#9b7428]">创建失败</p>
          <p className="mt-3 text-sm leading-7 text-[#4d665e]">
            {errorMessage}
          </p>
        </section>
      ) : null}

      {participantErrorMessage ? (
        <section className="mt-6 rounded-3xl border border-[#b7892c] bg-[#fff8ea] p-5">
          <p className="text-sm font-semibold text-[#9b7428]">添加失败</p>
          <p className="mt-3 text-sm leading-7 text-[#4d665e]">
            {participantErrorMessage}
          </p>
        </section>
      ) : null}

      {resultErrorMessage ? (
        <section className="mt-6 rounded-3xl border border-[#b7892c] bg-[#fff8ea] p-5">
          <p className="text-sm font-semibold text-[#9b7428]">保存失败</p>
          <p className="mt-3 text-sm leading-7 text-[#4d665e]">
            {resultErrorMessage}
          </p>
        </section>
      ) : null}

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <p className="text-sm font-semibold text-[#9b7428]">创建草稿</p>
        <form action={createGameDraftAction} className="mt-5 grid gap-4">
          <input name="store_id" type="hidden" value={pageData.data.store_id} />

          <label className="grid gap-2 text-sm font-semibold">
            包厢（可选）
            <select
              className="rounded-2xl border border-[#e1cfaa] bg-[#f7f1e6] px-4 py-3 text-sm font-medium"
              name="room_id"
            >
              <option value="">不选择包厢</option>
              {sortedRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            熟人圈（可选）
            <select
              className="rounded-2xl border border-[#e1cfaa] bg-[#f7f1e6] px-4 py-3 text-sm font-medium"
              name="circle_id"
            >
              <option value="">不选择熟人圈</option>
              {sortedCircles.map((circle) => (
                <option key={circle.id} value={circle.id}>
                  {circle.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            预约记录（可选）
            <select
              className="rounded-2xl border border-[#e1cfaa] bg-[#f7f1e6] px-4 py-3 text-sm font-medium"
              name="reservation_id"
            >
              <option value="">不关联预约记录</option>
              {pageData.data.reservations.map((reservation) => (
                <option key={reservation.id} value={reservation.id}>
                  {reservation.reservation_date} {reservation.start_time}-
                  {reservation.end_time} · {reservation.room?.name ?? "未命名包厢"}
                </option>
              ))}
            </select>
          </label>

          <button
            className="rounded-full bg-[#d3a443] px-5 py-3 text-sm font-semibold text-[#12332a]"
            type="submit"
          >
            创建牌局草稿
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <p className="text-sm font-semibold text-[#9b7428]">
          待添加参与玩家的牌局草稿
        </p>
        {pageData.data.latest_game_draft ? (
          <div className="mt-4 grid gap-4">
            <div className="rounded-2xl bg-[#f7f1e6] p-4 text-sm leading-7 text-[#4d665e]">
              <p>game_id：{pageData.data.latest_game_draft.id}</p>
              <p>status：{pageData.data.latest_game_draft.status}</p>
              <p>circle_id：{pageData.data.latest_game_draft.circle_id ?? "未绑定"}</p>
              <p>room_id：{pageData.data.latest_game_draft.room_id ?? "未选择"}</p>
            </div>

            {!pageData.data.latest_game_draft.circle_id ? (
              <p className="rounded-2xl bg-[#f7f1e6] p-4 text-sm leading-7 text-[#4d665e]">
                当前牌局没有绑定熟人圈，无法自动添加参与玩家
              </p>
            ) : null}

            <form action={addFourParticipantsAction}>
              <input
                name="game_id"
                type="hidden"
                value={pageData.data.latest_game_draft.id}
              />
              <button
                className="w-full rounded-full bg-[#d3a443] px-5 py-3 text-sm font-semibold text-[#12332a] disabled:opacity-50"
                disabled={!pageData.data.latest_game_draft.circle_id}
                type="submit"
              >
                添加4名参与玩家
              </button>
            </form>
          </div>
        ) : (
          <EmptyLine>暂无可添加参与玩家的牌局草稿。</EmptyLine>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <p className="text-sm font-semibold text-[#9b7428]">
          待保存娱乐积分结果的牌局
        </p>
        {pageData.data.latest_game_ready_for_results ? (
          <form action={saveEntertainmentResultsAction} className="mt-5 grid gap-4">
            <input
              name="game_id"
              type="hidden"
              value={pageData.data.latest_game_ready_for_results.game.id}
            />
            <div className="rounded-2xl bg-[#f7f1e6] p-4 text-sm leading-7 text-[#4d665e]">
              <p>
                game_id：{pageData.data.latest_game_ready_for_results.game.id}
              </p>
              <p>
                status：{pageData.data.latest_game_ready_for_results.game.status}
              </p>
            </div>

            <div className="grid gap-4">
              {pageData.data.latest_game_ready_for_results.participants.map(
                (participant) => (
                  <article
                    className="rounded-2xl bg-[#f7f1e6] p-4"
                    key={participant.id}
                  >
                    <input
                      name={`participant_id_${participant.seat_no}`}
                      type="hidden"
                      value={participant.id}
                    />
                    <input
                      name={`user_id_${participant.seat_no}`}
                      type="hidden"
                      value={participant.user_id}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-[#5d756d]">
                          seat_no {participant.seat_no}
                        </p>
                        <h3 className="mt-1 text-xl font-semibold">
                          {participant.user?.display_name ?? "未命名用户"}
                        </h3>
                      </div>
                      <label className="flex items-center gap-2 text-sm font-semibold">
                        <input
                          defaultChecked={participant.seat_no === 1}
                          name="mvp_seat"
                          type="radio"
                          value={participant.seat_no}
                        />
                        MVP
                      </label>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <label className="grid gap-2 text-sm font-semibold">
                        rank
                        <input
                          className="rounded-2xl border border-[#e1cfaa] bg-[#fff8ea] px-4 py-3 text-sm font-medium"
                          defaultValue={participant.seat_no}
                          max="4"
                          min="1"
                          name={`rank_${participant.seat_no}`}
                          required
                          type="number"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-semibold">
                        entertainment_score
                        <input
                          className="rounded-2xl border border-[#e1cfaa] bg-[#fff8ea] px-4 py-3 text-sm font-medium"
                          defaultValue={defaultScores[participant.seat_no] ?? 0}
                          name={`entertainment_score_${participant.seat_no}`}
                          required
                          type="number"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-semibold">
                        note（可选）
                        <input
                          className="rounded-2xl border border-[#e1cfaa] bg-[#fff8ea] px-4 py-3 text-sm font-medium"
                          name={`note_${participant.seat_no}`}
                          placeholder="休闲记录备注"
                          type="text"
                        />
                      </label>
                    </div>
                  </article>
                ),
              )}
            </div>

            <button
              className="rounded-full bg-[#d3a443] px-5 py-3 text-sm font-semibold text-[#12332a]"
              type="submit"
            >
              保存娱乐积分结果
            </button>
          </form>
        ) : (
          <EmptyLine>暂无可保存娱乐积分结果的牌局。</EmptyLine>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <p className="text-sm font-semibold text-[#9b7428]">快速开局步骤</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <div className="rounded-2xl bg-[#f7f1e6] p-4" key={step}>
              <p className="text-xs font-semibold text-[#9b7428]">
                STEP {index + 1}
              </p>
              <p className="mt-2 text-sm font-semibold">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <OverviewSection title="推荐开局圈子">
          {sortedCircles.length === 0 ? (
            <EmptyLine>暂无熟人圈数据。</EmptyLine>
          ) : (
            <div className="grid gap-3">
              {sortedCircles.slice(0, 4).map((circle) => (
                <article
                  className="rounded-2xl bg-[#f7f1e6] p-4"
                  key={circle.id}
                >
                  <h3 className="text-xl font-semibold">{circle.name}</h3>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    圈主：{circle.owner?.display_name ?? "未命名用户"}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <SmallMetric
                      label="成员数"
                      value={`${circle.member_count} 人`}
                    />
                    <SmallMetric
                      label="累计局数"
                      value={`${circle.game_count} 局`}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </OverviewSection>

        <OverviewSection title="推荐包厢">
          {sortedRooms.length === 0 ? (
            <EmptyLine>暂无可用包厢数据。</EmptyLine>
          ) : (
            <div className="grid gap-3">
              {sortedRooms.slice(0, 4).map((room) => (
                <article
                  className="rounded-2xl bg-[#f7f1e6] p-4"
                  key={room.id}
                >
                  <h3 className="text-xl font-semibold">{room.name}</h3>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    容量：{room.capacity} 人
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    楼层：{room.floor_label ?? "未设置"}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    状态：{room.status}
                  </p>
                </article>
              ))}
            </div>
          )}
        </OverviewSection>
      </section>

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <p className="text-sm font-semibold text-[#9b7428]">最近牌局草稿</p>
        {pageData.data.recent_games.length === 0 ? (
          <EmptyLine>暂无牌局草稿。</EmptyLine>
        ) : (
          <div className="mt-4 grid gap-3">
            {pageData.data.recent_games.map((game) => (
              <article className="rounded-2xl bg-[#f7f1e6] p-4" key={game.id}>
                <p className="text-sm font-semibold text-[#12332a]">
                  {game.id}
                </p>
                <div className="mt-3 grid gap-2 text-sm text-[#5d756d] sm:grid-cols-2">
                  <p>status：{game.status}</p>
                  <p>game_count：{game.game_count}</p>
                  <p>room_id：{game.room_id ?? "未选择"}</p>
                  <p>circle_id：{game.circle_id ?? "未选择"}</p>
                  <p>reservation_id：{game.reservation_id ?? "未选择"}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </GameShell>
  );
}

async function loadGamePageData(): Promise<
  | { status: "empty" }
  | { data: GamePageData; status: "ready" }
> {
  const store = await getFirstActiveStore();

  if (!store) {
    return { status: "empty" };
  }

  const [
    rooms,
    circles,
    reservations,
    recentGames,
    latestGameDraft,
    latestGameReadyForResults,
  ] = await Promise.all([
    listRoomsByStore(store.id),
    listCirclesWithMembersByStore(store.id),
    listReservationsWithDetailsByStore(store.id),
    listRecentGameDrafts(store.id),
    getLatestGameDraftByStore(store.id),
    getLatestGameReadyForResultsByStore(store.id),
  ]);
  const activeRooms = rooms.filter((room) => room.status === "active");

  return {
    data: {
      circles,
      latest_game_draft: latestGameDraft,
      latest_game_ready_for_results: latestGameReadyForResults,
      recent_games: recentGames,
      reservations,
      rooms: activeRooms,
      store_id: store.id,
      store_name: store.name,
    },
    status: "ready",
  };
}

function buildMetrics(data: GamePageData): Metric[] {
  return [
    { label: "可用包厢数量", suffix: "间", value: data.rooms.length },
    { label: "熟人圈数量", suffix: "个", value: data.circles.length },
    { label: "可选预约记录", suffix: "条", value: data.reservations.length },
    { label: "草稿数量", suffix: "条", value: data.recent_games.length },
  ];
}

type ParticipantResultRow = {
  display_name: string;
  seat_no: number;
};

type EntertainmentResultRow = {
  display_name: string;
  entertainment_score: string;
  rank: string;
};

function buildParticipantRows(
  searchParams: Record<string, string | string[] | undefined>,
): ParticipantResultRow[] {
  return [1, 2, 3, 4].flatMap((seatNo) => {
    const displayName = getSearchParam(searchParams, `seat_${seatNo}`);

    if (!displayName) {
      return [];
    }

    return [{ display_name: displayName, seat_no: seatNo }];
  });
}

function buildResultRows(
  searchParams: Record<string, string | string[] | undefined>,
): EntertainmentResultRow[] {
  return [1, 2, 3, 4].flatMap((rowNumber) => {
    const displayName = getSearchParam(searchParams, `result_player_${rowNumber}`);
    const rank = getSearchParam(searchParams, `result_rank_${rowNumber}`);
    const entertainmentScore = getSearchParam(
      searchParams,
      `result_score_${rowNumber}`,
    );

    if (!displayName || !rank || !entertainmentScore) {
      return [];
    }

    return [
      {
        display_name: displayName,
        entertainment_score: entertainmentScore,
        rank,
      },
    ];
  });
}

function sortRecommendedCircles(
  circles: CircleWithDetails[],
): CircleWithDetails[] {
  return [...circles].sort((first, second) => {
    const firstReady = first.member_count >= 4 ? 1 : 0;
    const secondReady = second.member_count >= 4 ? 1 : 0;

    if (secondReady !== firstReady) {
      return secondReady - firstReady;
    }

    return second.game_count - first.game_count;
  });
}

function sortRecommendedRooms(rooms: Room[]): Room[] {
  return [...rooms].sort((first, second) => {
    const firstActive = first.status === "active" ? 1 : 0;
    const secondActive = second.status === "active" ? 1 : 0;

    return secondActive - firstActive;
  });
}

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function formatNullableId(value: string | null): string {
  return value && value !== "null" ? value : "未选择";
}

function GameShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/player">
          返回玩家中心
        </Link>
        {children}
      </div>
    </main>
  );
}

function OverviewSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
      <p className="text-sm font-semibold text-[#9b7428]">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#fff8ea] p-3">
      <p className="text-xs text-[#5d756d]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function EmptyLine({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-[#f7f1e6] p-4 text-sm leading-7 text-[#4d665e]">
      {children}
    </p>
  );
}

function renderNoStoreState() {
  return (
    <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-8">
      <p className="text-sm font-semibold text-[#9b7428]">快速开局</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店。添加门店测试数据后，此页会显示真实开局选项。
      </p>
    </section>
  );
}
