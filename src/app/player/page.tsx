import Link from "next/link";

const shortcuts = [
  {
    title: "我的熟人圈",
    description: "查看常约牌友、活跃圈子与最近开局。",
    href: "/player/circles",
  },
  {
    title: "快速开局",
    description: "选择圈子与 4 名玩家，准备记录娱乐积分。",
    href: "/player/games/new",
  },
  {
    title: "我的战绩",
    description: "娱乐积分，仅作休闲记录。",
    href: "/player/results/demo",
  },
  {
    title: "我的卡券",
    description: "查看新人券、复购券、工作日券与圈主券。",
    href: "/player/coupons",
  },
  {
    title: "预约下一局",
    description: "选择门店、包厢、日期与时段。",
    href: "/player/reservations/new",
  },
];

const journey = [
  "扫码进入",
  "加入会员",
  "加入熟人圈",
  "快速开局",
  "记录娱乐积分",
  "生成战绩海报",
  "分享邀请好友",
  "领取复购券",
  "预约下一局",
];

export default function PlayerPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] text-[#12332a]">
      <section className="bg-[#12332a] px-5 py-8 text-[#fff8ea]">
        <div className="mx-auto max-w-5xl">
          <Link className="text-sm text-[#f1dba5]" href="/">
            麻将迷
          </Link>
          <h1 className="mt-6 text-3xl font-semibold leading-tight">
            玩家中心
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#e8dbc4]">
            从熟人圈到下一局预约，把每一次到店沉淀成可分享、可复购的休闲体验。
          </p>
          <p className="mt-5 rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4 text-sm text-[#f1dba5]">
            娱乐积分，仅作休闲记录；本系统不提供金钱胜负、玩家间清算、赊记管理能力。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {shortcuts.map((shortcut) => (
            <Link
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5 shadow-sm transition hover:border-[#b7892c]"
              href={shortcut.href}
              key={shortcut.title}
            >
              <p className="text-xl font-semibold">{shortcut.title}</p>
              <p className="mt-3 leading-7 text-[#4d665e]">
                {shortcut.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-10">
        <div className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
          <p className="text-sm font-semibold text-[#9b7428]">玩家核心路径</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {journey.map((step, index) => (
              <div
                className="flex items-center gap-3 rounded-full bg-[#f7f1e6] px-4 py-3 text-sm font-medium"
                key={step}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#12332a] text-xs text-[#f1dba5]">
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
