import Link from "next/link";

const circles = [
  {
    name: "周五老友局",
    owner: "林晨",
    members: 18,
    games: 126,
    activeAt: "今天 20:30",
    action: "邀请圈主分享战绩海报",
  },
  {
    name: "邻里轻松局",
    owner: "晴姐",
    members: 12,
    games: 64,
    activeAt: "昨天 19:10",
    action: "发放复购券推动再次预约",
  },
  {
    name: "午后休闲局",
    owner: "阿杰",
    members: 9,
    games: 38,
    activeAt: "3 天前",
    action: "配置工作日活动激活",
  },
];

export default function AdminCirclesPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/admin">
          返回老板首页
        </Link>
        <header className="mt-6">
          <p className="text-sm font-semibold text-[#9b7428]">圈子管理</p>
          <h1 className="mt-3 text-3xl font-semibold">活跃熟人圈</h1>
          <p className="mt-3 leading-7 text-[#4d665e]">
            关注圈主、成员数、累计局数、最近活跃与下一步运营动作。
          </p>
        </header>

        <section className="mt-8 grid gap-4">
          {circles.map((circle) => (
            <article
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5"
              key={circle.name}
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr] lg:items-center">
                <div>
                  <h2 className="text-2xl font-semibold">{circle.name}</h2>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    圈主：{circle.owner} · 最近活跃：{circle.activeAt}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="成员数" value={`${circle.members} 人`} />
                  <Metric label="累计局数" value={`${circle.games} 局`} />
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-[#12332a] p-4 text-[#fff8ea]">
                <p className="text-sm text-[#f1dba5]">建议动作</p>
                <p className="mt-2 font-semibold">{circle.action}</p>
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
