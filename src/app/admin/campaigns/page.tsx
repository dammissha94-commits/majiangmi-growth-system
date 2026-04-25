import Link from "next/link";

const campaigns = [
  {
    name: "好友局",
    goal: "邀请熟人圈好友到店",
    action: "分享战绩海报并预约下一局",
  },
  {
    name: "工作日激活",
    goal: "提升空置时段利用",
    action: "向低频会员发放工作日券",
  },
  {
    name: "老带新",
    goal: "带动新会员加入",
    action: "圈主邀请好友扫码入店",
  },
  {
    name: "圈子榜",
    goal: "提升熟人圈活跃",
    action: "按累计局数展示圈子活跃度",
  },
  {
    name: "生日局",
    goal: "强化会员关怀",
    action: "为生日会员配置专属预约提醒",
  },
];

export default function AdminCampaignsPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/admin">
          返回老板首页
        </Link>
        <header className="mt-6">
          <p className="text-sm font-semibold text-[#9b7428]">活动管理</p>
          <h1 className="mt-3 text-3xl font-semibold">门店活动模板</h1>
          <p className="mt-3 leading-7 text-[#4d665e]">
            用活动模板连接熟人圈、会员、卡券和预约转化。
          </p>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <article
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5"
              key={campaign.name}
            >
              <h2 className="text-2xl font-semibold">{campaign.name}</h2>
              <p className="mt-3 leading-7 text-[#4d665e]">{campaign.goal}</p>
              <div className="mt-5 rounded-2xl bg-[#12332a] p-4 text-[#fff8ea]">
                <p className="text-sm text-[#f1dba5]">建议动作</p>
                <p className="mt-2 font-semibold">{campaign.action}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
