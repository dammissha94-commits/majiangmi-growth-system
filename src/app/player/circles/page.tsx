import Link from "next/link";

const circles = [
  {
    name: "周五老友局",
    members: 18,
    gameCount: 126,
    activeAt: "今天 20:30",
  },
  {
    name: "邻里轻松局",
    members: 12,
    gameCount: 64,
    activeAt: "昨天 19:10",
  },
  {
    name: "午后休闲局",
    members: 9,
    gameCount: 38,
    activeAt: "3 天前",
  },
];

export default function PlayerCirclesPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/player">
          返回玩家中心
        </Link>
        <header className="mt-6">
          <p className="text-sm font-semibold text-[#9b7428]">熟人圈列表</p>
          <h1 className="mt-3 text-3xl font-semibold">我的熟人圈</h1>
          <p className="mt-3 leading-7 text-[#4d665e]">
            和常约牌友保持连接，查看成员数、累计局数与最近活跃时间。
          </p>
        </header>

        <section className="mt-8 grid gap-4">
          {circles.map((circle) => (
            <article
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5 shadow-sm"
              key={circle.name}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{circle.name}</h2>
                  <p className="mt-2 text-sm text-[#4d665e]">
                    最近活跃：{circle.activeAt}
                  </p>
                </div>
                <Link
                  className="rounded-full border border-[#b7892c] px-4 py-2 text-center text-sm font-semibold text-[#12332a]"
                  href="/player/games/new"
                >
                  快速开局
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label="成员数" value={`${circle.members} 人`} />
                <Metric label="累计局数" value={`${circle.gameCount} 局`} />
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl bg-[#f7f1e6] p-4">
      <p className="text-sm text-[#5d756d]">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
