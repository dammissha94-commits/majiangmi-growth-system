import Image from "next/image";

const loopSteps = [
  "扫码入店",
  "加入会员",
  "熟人圈",
  "预约包厢",
  "快速开局",
  "娱乐积分",
  "战绩海报",
  "分享拉新",
  "复购券",
  "再次预约",
  "老板复盘",
];

const playerValues = [
  "快速开局",
  "熟人圈",
  "娱乐积分",
  "战绩海报",
  "卡券",
  "预约下一局",
];

const ownerValues = [
  "新增会员",
  "今日预约",
  "今日开局",
  "老客复购",
  "活跃圈子",
  "卡券核销",
  "空置时段提示",
];

const pilotSteps = [
  "第 1-3 天：梳理门店会员、包厢与预约流程",
  "第 4-7 天：上线熟人圈、娱乐积分与战绩海报传播",
  "第 8-11 天：配置复购券、活动转化与再次预约提醒",
  "第 12-14 天：复盘会员沉淀、预约转化与老板经营看板",
];

const plans = [
  {
    name: "试点版",
    price: "14 天",
    description: "适合单店验证复购闭环，快速看见会员沉淀与预约转化。",
    features: ["基础门店页", "预约与开局记录", "娱乐积分与战绩海报"],
  },
  {
    name: "增长版",
    price: "单店增长",
    description: "适合稳定运营门店，强化熟人圈活跃、卡券复购与老板复盘。",
    features: ["熟人圈运营", "复购券配置", "经营看板"],
  },
  {
    name: "运营版",
    price: "多店运营",
    description: "适合品牌门店复制，沉淀活动模板与标准化运营节奏。",
    features: ["活动模板", "多门店复盘", "品牌升级支持"],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] text-[#12332a]">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-20 border-b border-[#d9c9a3]/60 bg-[#f7f1e6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a className="flex items-center gap-2.5" href="#hero">
            <Image
              alt="麻将迷"
              className="rounded-lg"
              height={36}
              src="/logo.png"
              width={36}
            />
            <span className="text-lg font-semibold tracking-wide">麻将迷</span>
          </a>
          <div className="hidden items-center gap-6 text-sm text-[#38594f] md:flex">
            <a className="transition hover:text-[#b7892c]" href="#loop">
              商业闭环
            </a>
            <a className="transition hover:text-[#b7892c]" href="#value">
              核心价值
            </a>
            <a className="transition hover:text-[#b7892c]" href="#pilot">
              14天试点
            </a>
            <a className="transition hover:text-[#b7892c]" href="#plans">
              合作套餐
            </a>
          </div>
          <a
            className="rounded-full border border-[#b7892c] px-4 py-2 text-sm font-medium text-[#12332a] transition hover:bg-[#b7892c] hover:text-[#12332a]"
            href="#plans"
          >
            了解合作
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative overflow-hidden bg-[#12332a] text-[#fff8ea]"
        id="hero"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-[#d3a443]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <Image
                alt="麻将迷"
                className="rounded-2xl"
                height={56}
                src="/logo.png"
                width={56}
              />
            </div>
            <p className="mb-4 inline-flex rounded-full border border-[#d3a443]/60 px-3 py-1 text-sm text-[#f1dba5]">
              社区棋牌室品牌升级与复购增长
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
              麻将迷门店复购增长系统
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#e8dbc4]">
              不是记分工具，是围绕会员、预约、熟人圈、卡券与活动转化搭建的门店增长系统。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="rounded-full bg-[#d3a443] px-6 py-3 text-center text-sm font-semibold text-[#12332a] transition hover:bg-[#e5bd67]"
                href="#pilot"
              >
                查看 14 天试点
              </a>
              <a
                className="rounded-full border border-[#ead8b6]/60 px-6 py-3 text-center text-sm font-semibold text-[#fff8ea] transition hover:border-[#d3a443] hover:text-[#f1dba5]"
                href="#loop"
              >
                了解增长闭环
              </a>
            </div>
          </div>

          {/* 门店外观实景 */}
          <div className="overflow-hidden rounded-[2rem] shadow-2xl shadow-black/40">
            <Image
              alt="麻将迷门店外观"
              className="w-full object-cover"
              height={500}
              priority
              src="/store-hero.png"
              width={640}
            />
          </div>
        </div>
      </section>

      {/* 商业闭环 */}
      <section className="mx-auto max-w-6xl px-5 py-14" id="loop">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-[#9b7428]">商业闭环</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
            从第一次扫码，到下一次预约
          </h2>
          <p className="mt-4 leading-7 text-[#4d665e]">
            把门店里原本分散的到店、开局、传播、卡券与复盘动作，连成可持续的复购路径。
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {loopSteps.map((step, index) => (
            <div
              className="flex items-center gap-3 rounded-full border border-[#dbc99e] bg-[#fff8ea] px-4 py-3 text-sm font-medium"
              key={step}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#12332a] text-xs text-[#f1dba5]">
                {index + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 门店实景展示 */}
      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl shadow-md">
            <Image
              alt="麻将迷包厢内景"
              className="h-64 w-full object-cover md:h-80"
              height={500}
              src="/store-room.png"
              width={800}
            />
          </div>
          <div className="overflow-hidden rounded-3xl shadow-md">
            <Image
              alt="麻将迷前台接待"
              className="h-64 w-full object-cover md:h-80"
              height={500}
              src="/store-reception.png"
              width={800}
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "私密包厢", desc: "专属空间，沉浸体验" },
            { label: "品质牌桌", desc: "自动麻将机，全程无忧" },
            { label: "专业服务", desc: "茶点配套，管家式接待" },
          ].map((item) => (
            <div
              className="rounded-2xl border border-[#dbc99e] bg-[#fff8ea] px-4 py-5"
              key={item.label}
            >
              <p className="font-semibold text-[#12332a]">{item.label}</p>
              <p className="mt-1.5 text-sm text-[#5d756d]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 核心价值 */}
      <section className="bg-[#fff8ea] py-14" id="value">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 md:grid-cols-2">
          <ValuePanel
            description="让玩家更容易开局、沉淀关系、分享战绩，并自然回到下一次预约。"
            items={playerValues}
            title="玩家价值"
          />
          <ValuePanel
            description="让老板看得见会员增长、包厢利用、老客复购与活动转化。"
            items={ownerValues}
            title="老板价值"
          />
        </div>
      </section>

      {/* 14天试点 */}
      <section className="mx-auto max-w-6xl px-5 py-14" id="pilot">
        <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-start">
          <div>
            <p className="text-sm font-semibold text-[#9b7428]">14 天试点方案</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              用两周验证一套可复用的门店增长节奏
            </h2>
          </div>
          <div className="space-y-3">
            {pilotSteps.map((step) => (
              <div
                className="rounded-2xl border border-[#dbc99e] bg-[#fff8ea] p-5 leading-7 shadow-sm"
                key={step}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 合作套餐 */}
      <section className="bg-[#12332a] py-14 text-[#fff8ea]" id="plans">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-[#f1dba5]">合作套餐</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              从单店试点，到品牌化运营
            </h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                className="rounded-3xl border border-[#d3a443]/50 bg-[#173f35] p-6"
                key={plan.name}
              >
                <p className="text-xl font-semibold">{plan.name}</p>
                <p className="mt-2 text-3xl font-semibold text-[#f1dba5]">
                  {plan.price}
                </p>
                <p className="mt-4 min-h-20 leading-7 text-[#e8dbc4]">
                  {plan.description}
                </p>
                <ul className="mt-5 space-y-3">
                  {plan.features.map((feature) => (
                    <li className="flex gap-3 text-sm" key={feature}>
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#d3a443]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 合规边界 */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-6 md:p-8">
          <p className="text-sm font-semibold text-[#9b7428]">合规边界</p>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
            只服务娱乐积分与门店经营增长
          </h2>
          <p className="mt-4 max-w-4xl leading-8 text-[#4d665e]">
            系统只记录娱乐积分、名次、局数与门店运营数据；不提供现金输赢、玩家结算、欠
            款管理功能。
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d9c9a3]/60 bg-[#f7f1e6]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6">
          <div className="flex items-center gap-2.5">
            <Image
              alt="麻将迷"
              className="rounded-lg opacity-80"
              height={28}
              src="/logo.png"
              width={28}
            />
            <span className="text-sm font-medium text-[#5d756d]">
              麻将迷 MAJIANGMI
            </span>
          </div>
          <p className="text-xs text-[#9b7428]">娱乐积分，仅作休闲记录</p>
        </div>
      </footer>
    </main>
  );
}

type ValuePanelProps = {
  description: string;
  items: string[];
  title: string;
};

function ValuePanel({ description, items, title }: ValuePanelProps) {
  return (
    <article className="rounded-3xl border border-[#dbc99e] bg-[#f7f1e6] p-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-3 leading-7 text-[#4d665e]">{description}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            className="rounded-2xl border border-[#e1cfaa] bg-[#fffaf0] px-4 py-3 text-sm font-medium"
            key={item}
          >
            {item}
          </div>
        ))}
      </div>
    </article>
  );
}
