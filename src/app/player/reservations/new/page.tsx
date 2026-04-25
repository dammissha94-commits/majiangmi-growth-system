import Link from "next/link";

const rooms = ["青竹包厢", "松风包厢", "金桂包厢"];
const dates = ["今天", "明天", "周五"];
const timeSlots = ["14:00-17:00", "19:00-22:00", "22:00-次日 01:00"];

export default function NewReservationPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/player">
          返回玩家中心
        </Link>
        <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
          <p className="text-sm font-semibold text-[#f1dba5]">预约下一局</p>
          <h1 className="mt-3 text-3xl font-semibold">选择门店、包厢与时段</h1>
          <p className="mt-3 leading-7 text-[#e8dbc4]">
            静态预约界面，用于展示玩家再次到店路径。
          </p>
        </header>

        <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
          <p className="text-sm text-[#5d756d]">门店</p>
          <h2 className="mt-2 text-2xl font-semibold">麻将迷社区棋牌室</h2>
        </section>

        <PickerSection items={rooms} title="选择包厢" />
        <PickerSection items={dates} title="选择日期" />
        <PickerSection items={timeSlots} title="选择时段" />

        <section className="mt-5 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
          <p className="text-sm font-semibold text-[#9b7428]">预约摘要</p>
          <div className="mt-4 space-y-2 leading-7 text-[#4d665e]">
            <p>门店：麻将迷社区棋牌室</p>
            <p>包厢：青竹包厢</p>
            <p>日期：今天</p>
            <p>时段：19:00-22:00</p>
          </div>
          <button
            className="mt-5 w-full rounded-full bg-[#d3a443] px-5 py-3 text-sm font-semibold text-[#12332a]"
            type="button"
          >
            确认预约占位
          </button>
        </section>
      </div>
    </main>
  );
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
