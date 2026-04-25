import Link from "next/link";

const dashboardMetrics = [
  { label: "新增会员", value: "86 人", trend: "较上周提升 18%" },
  { label: "复购用户", value: "143 人", trend: "复购券带动明显" },
  { label: "活跃圈子", value: "12 个", trend: "周五老友局最活跃" },
  { label: "战绩海报分享", value: "238 次", trend: "分享邀请持续增长" },
  { label: "卡券核销", value: "96 张", trend: "工作日券仍有空间" },
  { label: "活动转化", value: "31 组", trend: "老带新表现稳定" },
];

const notes = [
  "娱乐积分，仅作休闲记录。",
  "优先激活 7 天未到店会员。",
  "提升午后空置时段的预约转化。",
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/admin">
          返回老板首页
        </Link>
        <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
          <p className="text-sm font-semibold text-[#f1dba5]">数据复盘</p>
          <h1 className="mt-3 text-3xl font-semibold">门店经营看板</h1>
          <p className="mt-3 leading-7 text-[#e8dbc4]">
            汇总会员、预约、开局、圈子、卡券与活动转化表现。
          </p>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardMetrics.map((metric) => (
            <article
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5"
              key={metric.label}
            >
              <p className="text-sm text-[#5d756d]">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
              <p className="mt-3 text-sm leading-6 text-[#4d665e]">
                {metric.trend}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
          <p className="text-sm font-semibold text-[#9b7428]">复盘结论</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {notes.map((note) => (
              <div
                className="rounded-2xl bg-[#f7f1e6] p-4 text-sm font-medium leading-6"
                key={note}
              >
                {note}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
