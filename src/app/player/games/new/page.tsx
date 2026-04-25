import Link from "next/link";
import type { ReactNode } from "react";

import { getFirstActiveStore } from "@/lib/services/dashboard_service";
import {
  listCirclesWithMembersByStore,
  type CircleWithDetails,
} from "@/lib/services/circle_service";
import { listRoomsByStore } from "@/lib/services/room_service";
import type { Room } from "@/types/domain";

export const dynamic = "force-dynamic";

type GamePageData = {
  circles: CircleWithDetails[];
  rooms: Room[];
  store_name: string;
};

type Metric = {
  label: string;
  suffix: string;
  value: number;
};

const steps = [
  "选择熟人圈",
  "选择包厢",
  "确认4名玩家",
  "录入娱乐积分",
  "生成战绩海报",
];

const scorePreview = [
  { entertainment_score: 128, name: "阿明", rank: 1 },
  { entertainment_score: 96, name: "老周", rank: 2 },
  { entertainment_score: 82, name: "小陈", rank: 3 },
  { entertainment_score: 68, name: "阿杰", rank: 4 },
];

export default async function NewGamePage() {
  const pageData = await loadGamePageData();

  if (pageData.status === "empty") {
    return <GameShell>{renderNoStoreState()}</GameShell>;
  }

  const metrics = buildMetrics(pageData.data);
  const sortedCircles = sortRecommendedCircles(pageData.data.circles);
  const sortedRooms = sortRecommendedRooms(pageData.data.rooms);
  const tips = buildTips(sortedCircles);

  return (
    <GameShell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">快速开局</p>
        <h1 className="mt-3 text-3xl font-semibold">选择圈子、包厢与玩家</h1>
        <p className="mt-3 text-xl font-semibold">{pageData.data.store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          读取真实门店、熟人圈成员和包厢数据，生成快速开局草稿。
        </p>
        <div className="mt-4 grid gap-3 text-sm text-[#f1dba5] md:grid-cols-2">
          <p className="rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4">
            娱乐积分，仅作休闲记录。
          </p>
          <p className="rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4">
            当前页面仅为快速开局草稿，不会写入牌局结果。
          </p>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
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

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <p className="text-sm font-semibold text-[#9b7428]">开局提示</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {tips.map((tip) => (
            <div
              className="rounded-2xl bg-[#f7f1e6] p-4 text-sm font-medium leading-6"
              key={tip}
            >
              {tip}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <p className="text-sm font-semibold text-[#9b7428]">推荐开局圈子</p>
        <h2 className="mt-2 text-2xl font-semibold">优先选择人数完整的熟人圈</h2>

        {sortedCircles.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-[#f7f1e6] p-4 text-sm leading-7 text-[#4d665e]">
            暂无熟人圈数据。
          </p>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {sortedCircles.map((circle, index) => (
              <article
                className={`rounded-2xl p-4 ${
                  index === 0
                    ? "border border-[#b7892c] bg-[#f1dba5]"
                    : "bg-[#f7f1e6]"
                }`}
                key={circle.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">{circle.name}</h3>
                    <p className="mt-2 text-sm text-[#5d756d]">
                      圈主：{circle.owner?.display_name ?? "未命名用户"}
                    </p>
                  </div>
                  {circle.member_count >= 4 ? (
                    <span className="rounded-full bg-[#12332a] px-3 py-1 text-xs font-semibold text-[#fff8ea]">
                      可直接开局
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <SmallMetric label="成员数" value={`${circle.member_count} 人`} />
                  <SmallMetric label="累计局数" value={`${circle.game_count} 局`} />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[#9b7428]">
                    成员列表
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {circle.members.length > 0 ? (
                      circle.members.map((member) => (
                        <span
                          className="rounded-full bg-[#fff8ea] px-3 py-1 text-xs font-semibold"
                          key={member.id}
                        >
                          {member.user?.display_name ?? "未命名用户"}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-[#fff8ea] px-3 py-1 text-xs font-semibold text-[#5d756d]">
                        暂无成员
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <p className="text-sm font-semibold text-[#9b7428]">推荐包厢</p>
        <h2 className="mt-2 text-2xl font-semibold">优先选择可用包厢</h2>

        {sortedRooms.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-[#f7f1e6] p-4 text-sm leading-7 text-[#4d665e]">
            暂无可用包厢数据。
          </p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {sortedRooms.map((room, index) => (
              <article
                className={`rounded-2xl p-4 ${
                  index === 0
                    ? "border border-[#b7892c] bg-[#f1dba5]"
                    : "bg-[#f7f1e6]"
                }`}
                key={room.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{room.name}</h3>
                    <p className="mt-2 text-sm text-[#5d756d]">
                      容量：{room.capacity} 人
                    </p>
                    <p className="mt-2 text-sm text-[#5d756d]">
                      楼层：{room.floor_label ?? "未设置"}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#12332a] px-3 py-1 text-xs font-semibold text-[#fff8ea]">
                    {room.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <p className="text-sm font-semibold text-[#9b7428]">娱乐积分录入预览</p>
        <h2 className="mt-2 text-2xl font-semibold">4 名玩家草稿</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {scorePreview.map((player) => (
            <article
              className="rounded-2xl bg-[#f7f1e6] p-4"
              key={player.name}
            >
              <p className="text-sm text-[#5d756d]">{player.name}</p>
              <p className="mt-2 text-lg font-semibold">rank {player.rank}</p>
              <p className="mt-2 text-sm text-[#5d756d]">
                entertainment_score：{player.entertainment_score}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            className="rounded-full bg-[#12332a] px-5 py-3 text-sm font-semibold text-[#fff8ea]"
            type="button"
          >
            确认开局
          </button>
          <button
            className="rounded-full bg-[#d3a443] px-5 py-3 text-sm font-semibold text-[#12332a]"
            type="button"
          >
            生成战绩海报
          </button>
        </div>
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

  const [rooms, circles] = await Promise.all([
    listRoomsByStore(store.id),
    listCirclesWithMembersByStore(store.id),
  ]);
  const activeRooms = rooms.filter((room) => room.status === "active");

  return {
    data: {
      circles,
      rooms: activeRooms,
      store_name: store.name,
    },
    status: "ready",
  };
}

function buildMetrics(data: GamePageData): Metric[] {
  return [
    { label: "可用包厢数量", suffix: "间", value: data.rooms.length },
    { label: "熟人圈数量", suffix: "个", value: data.circles.length },
  ];
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

function buildTips(circles: CircleWithDetails[]): string[] {
  const hasReadyCircle = circles.some((circle) => circle.member_count >= 4);
  const hasHistoryCircle = circles.some((circle) => circle.game_count > 0);
  const tips: string[] = [];

  if (hasReadyCircle) {
    tips.push("该圈子人数完整，可直接开局");
  }

  if (hasHistoryCircle) {
    tips.push("该圈子已有历史局数，适合延续熟人局记录");
  }

  if (tips.length === 0) {
    tips.push("可先确认4名玩家，再生成快速开局草稿");
  }

  return tips;
}

type SmallMetricProps = {
  label: string;
  value: string;
};

function SmallMetric({ label, value }: SmallMetricProps) {
  return (
    <div className="rounded-2xl bg-[#fff8ea] p-4">
      <p className="text-sm text-[#5d756d]">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
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
