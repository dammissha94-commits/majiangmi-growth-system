import Link from "next/link";

const metrics = [
  { label: "今日预约", value: "18 桌", hint: "晚间高峰较满" },
  { label: "今日开局", value: "12 局", hint: "娱乐积分，仅作休闲记录" },
  { label: "新增会员", value: "9 人", hint: "扫码入店转化" },
  { label: "老客复购", value: "31 人", hint: "近 7 天再次到店" },
  { label: "活跃圈子", value: "6 个", hint: "今日有互动" },
  { label: "卡券核销", value: "24 张", hint: "复购券表现较好" },
  { label: "7天未到店用户", value: "42 人", hint: "适合提醒回访" },
  { label: "空置时段提示", value: "14:00-17:00", hint: "可配置工作日活动" },
];

const actions = [
  "向 7 天未到店会员发放复购券",
  "推动周五老友局分享战绩海报",
  "为空置时段配置工作日活动",
  "邀请活跃圈主预约下一局",
];

const navItems = [
  { title: "会员管理", href: "/admin/memberships" },
  { title: "圈子管理", href: "/admin/circles" },
  { title: "预约管理", href: "/admin/reservations" },
  { title: "卡券管理", href: "/admin/coupons" },
  { title: "活动管理", href: "/admin/campaigns" },
  { title: "数据复盘", href: "/admin/dashboard" },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] text-[#12332a]">
      <section className="bg-[#12332a] px-5 py-8 text-[#fff8ea]">
        <div className="mx-auto max-w-6xl">
          <Link className="text-sm text-[#f1dba5]" href="/">
            麻将迷
          </Link>
          <h1 className="mt-6 text-3xl font-semibold md:text-5xl">
            老板经营首页
          </h1>
          <p className="mt-4 max-w-3xl leading-8 text-[#e8dbc4]">
            一眼查看预约、开局、会员、圈子、卡券与复购状态，快速判断下一步运营动作。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <article
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5 shadow-sm"
              key={metric.label}
            >
              <p className="text-sm text-[#5d756d]">{metric.label}</p>
              <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
              <p className="mt-3 text-sm leading-6 text-[#4d665e]">
                {metric.hint}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
          <p className="text-sm font-semibold text-[#9b7428]">建议动作</p>
          <div className="mt-4 space-y-3">
            {actions.map((action, index) => (
              <div
                className="flex gap-3 rounded-2xl bg-[#f7f1e6] p-4 text-sm font-medium"
                key={action}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#12332a] text-xs text-[#f1dba5]">
                  {index + 1}
                </span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
          <p className="text-sm font-semibold text-[#9b7428]">后台入口</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {navItems.map((item) => (
              <Link
                className="rounded-2xl border border-[#e1cfaa] bg-[#f7f1e6] px-4 py-4 text-sm font-semibold transition hover:border-[#b7892c]"
                href={item.href}
                key={item.title}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
