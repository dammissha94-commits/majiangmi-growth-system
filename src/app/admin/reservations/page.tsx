import Link from "next/link";

const reservations = [
  {
    date: "今天",
    time: "19:00-22:00",
    room: "青竹包厢",
    circle: "周五老友局",
    status: "已确认",
    source: "复购券",
  },
  {
    date: "明天",
    time: "14:00-17:00",
    room: "松风包厢",
    circle: "午后休闲局",
    status: "待确认",
    source: "工作日活动",
  },
  {
    date: "周五",
    time: "20:00-23:00",
    room: "金桂包厢",
    circle: "邻里轻松局",
    status: "已确认",
    source: "好友邀请",
  },
];

export default function AdminReservationsPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/admin">
          返回老板首页
        </Link>
        <header className="mt-6">
          <p className="text-sm font-semibold text-[#9b7428]">预约管理</p>
          <h1 className="mt-3 text-3xl font-semibold">门店预约排期</h1>
          <p className="mt-3 leading-7 text-[#4d665e]">
            查看预约日期、时段、包厢、圈子、状态与来源。
          </p>
        </header>

        <section className="mt-8 grid gap-4">
          {reservations.map((reservation) => (
            <article
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5"
              key={`${reservation.date}-${reservation.room}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {reservation.date} · {reservation.time}
                  </h2>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    {reservation.room} · {reservation.circle}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#f1dba5] px-3 py-1 text-xs font-semibold">
                    {reservation.status}
                  </span>
                  <span className="rounded-full bg-[#f7f1e6] px-3 py-1 text-xs font-semibold">
                    {reservation.source}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
