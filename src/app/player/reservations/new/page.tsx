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

type ReservationPageData = {
  circles: CircleWithDetails[];
  rooms: Room[];
  store_name: string;
};

type Metric = {
  label: string;
  suffix: string;
  value: number;
};

const recommendedDates = ["今天", "明天", "周末"];
const recommendedTimeSlots = ["14:00-17:00", "19:00-22:00", "22:00-24:00"];

export default async function NewReservationPage() {
  const pageData = await loadReservationPageData();

  if (pageData.status === "empty") {
    return <ReservationShell>{renderNoStoreState()}</ReservationShell>;
  }

  const metrics = buildMetrics(pageData.data);
  const tips = buildTips(pageData.data.rooms, pageData.data.circles);

  return (
    <ReservationShell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">预约下一局</p>
        <h1 className="mt-3 text-3xl font-semibold">选择包厢、圈子与时段</h1>
        <p className="mt-3 text-xl font-semibold">{pageData.data.store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          根据门店真实包厢和熟人圈数据生成预约草稿，方便下一次快速到店开局。
        </p>
        <p className="mt-4 rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4 text-sm text-[#f1dba5]">
          娱乐积分，仅作休闲记录。
        </p>
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
        <p className="text-sm font-semibold text-[#9b7428]">预约建议</p>
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

      <PickerSection items={recommendedDates} title="推荐预约日期" />
      <PickerSection items={recommendedTimeSlots} title="推荐时段" />

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#9b7428]">可预约包厢</p>
            <h2 className="mt-2 text-2xl font-semibold">选择包厢</h2>
          </div>
          <button
            className="rounded-full border border-[#b7892c] px-4 py-2 text-sm font-semibold"
            type="button"
          >
            选择包厢
          </button>
        </div>

        {pageData.data.rooms.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-[#f7f1e6] p-4 text-sm leading-7 text-[#4d665e]">
            暂无可预约包厢。
          </p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {pageData.data.rooms.map((room) => (
              <article
                className="rounded-2xl bg-[#f7f1e6] p-4"
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
                  <span className="rounded-full bg-[#f1dba5] px-3 py-1 text-xs font-semibold">
                    {room.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#9b7428]">熟人圈</p>
            <h2 className="mt-2 text-2xl font-semibold">选择圈子</h2>
          </div>
          <button
            className="rounded-full border border-[#b7892c] px-4 py-2 text-sm font-semibold"
            type="button"
          >
            选择圈子
          </button>
        </div>

        {pageData.data.circles.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-[#f7f1e6] p-4 text-sm leading-7 text-[#4d665e]">
            暂无熟人圈数据。
          </p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {pageData.data.circles.map((circle) => (
              <article
                className="rounded-2xl bg-[#f7f1e6] p-4"
                key={circle.id}
              >
                <h3 className="text-xl font-semibold">{circle.name}</h3>
                <div className="mt-3 grid gap-2 text-sm text-[#5d756d]">
                  <p>圈主：{circle.owner?.display_name ?? "未命名用户"}</p>
                  <p>成员数：{circle.member_count} 人</p>
                  <p>累计局数：{circle.game_count} 局</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <p className="text-sm font-semibold text-[#9b7428]">预约草稿</p>
        <div className="mt-4 space-y-2 leading-7 text-[#4d665e]">
          <p>门店：{pageData.data.store_name}</p>
          <p>日期：今天</p>
          <p>时段：19:00-22:00</p>
          <p>包厢和圈子可从上方列表中选择。</p>
        </div>
        <button
          className="mt-5 w-full rounded-full bg-[#d3a443] px-5 py-3 text-sm font-semibold text-[#12332a]"
          type="button"
        >
          生成预约草稿
        </button>
      </section>
    </ReservationShell>
  );
}

async function loadReservationPageData(): Promise<
  | { status: "empty" }
  | { data: ReservationPageData; status: "ready" }
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

function buildMetrics(data: ReservationPageData): Metric[] {
  return [
    { label: "可预约包厢数量", suffix: "间", value: data.rooms.length },
    { label: "熟人圈数量", suffix: "个", value: data.circles.length },
  ];
}

function buildTips(rooms: Room[], circles: CircleWithDetails[]): string[] {
  const hasActiveRoom = rooms.some((room) => room.status === "active");
  const hasReadyCircle = circles.some((circle) => circle.member_count >= 4);
  const hasFrequentCircle = circles.some((circle) => circle.game_count > 0);
  const tips: string[] = [];

  if (hasActiveRoom) {
    tips.push("建议优先选择空闲时段预约");
  }

  if (hasReadyCircle) {
    tips.push("该熟人圈人数完整，可直接预约下一局");
  }

  if (hasFrequentCircle) {
    tips.push("高频熟人圈适合优先安排晚间黄金时段");
  }

  if (rooms.length === 0) {
    tips.push("当前暂无可预约包厢，请联系门店确认");
  }

  if (tips.length === 0) {
    tips.push("可先确认圈子成员时间，再生成预约草稿");
  }

  return tips;
}

type PickerSectionProps = {
  items: string[];
  title: string;
};

function PickerSection({ items, title }: PickerSectionProps) {
  return (
    <section className="mt-5 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {items.map((item, index) => (
          <button
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium ${
              index === 0
                ? "border-[#b7892c] bg-[#f1dba5]"
                : "border-[#e1cfaa] bg-[#f7f1e6]"
            }`}
            key={item}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

function ReservationShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-5xl">
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
      <p className="text-sm font-semibold text-[#9b7428]">预约下一局</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店。添加门店测试数据后，此页会显示真实预约选项。
      </p>
    </section>
  );
}
