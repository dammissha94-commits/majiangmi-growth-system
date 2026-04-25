import Link from "next/link";

const members = [
  {
    name: "林晨",
    level: "金卡会员",
    visits: 18,
    games: 46,
    lastVisit: "今天",
    tags: ["活跃圈主", "常约晚间"],
  },
  {
    name: "晴姐",
    level: "银卡会员",
    visits: 12,
    games: 31,
    lastVisit: "昨天",
    tags: ["复购稳定", "偏好周末"],
  },
  {
    name: "阿杰",
    level: "新会员",
    visits: 3,
    games: 8,
    lastVisit: "4 天前",
    tags: ["新人券", "待回访"],
  },
];

export default function AdminMembershipsPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/admin">
          返回老板首页
        </Link>
        <header className="mt-6">
          <p className="text-sm font-semibold text-[#9b7428]">会员管理</p>
          <h1 className="mt-3 text-3xl font-semibold">门店会员沉淀</h1>
          <p className="mt-3 leading-7 text-[#4d665e]">
            查看会员等级、到店次数、开局次数、最近到店与用户标签。
          </p>
        </header>

        <section className="mt-8 overflow-hidden rounded-3xl border border-[#dbc99e] bg-[#fff8ea]">
          {members.map((member) => (
            <article
              className="border-b border-[#e1cfaa] p-5 last:border-b-0"
              key={member.name}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{member.name}</h2>
                  <p className="mt-2 text-sm text-[#5d756d]">{member.level}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <Metric label="到店次数" value={`${member.visits} 次`} />
                  <Metric label="开局次数" value={`${member.games} 局`} />
                  <Metric label="最近到店" value={member.lastVisit} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {member.tags.map((tag) => (
                  <span
                    className="rounded-full bg-[#f1dba5] px-3 py-1 text-xs font-semibold"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
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
    <div className="rounded-2xl bg-[#f7f1e6] p-3">
      <p className="text-xs text-[#5d756d]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
