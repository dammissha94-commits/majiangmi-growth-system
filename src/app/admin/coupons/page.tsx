import Link from "next/link";

const coupons = [
  {
    name: "新人券",
    type: "会员转化",
    issued: 120,
    used: 46,
    scene: "扫码入店后首次加入会员",
  },
  {
    name: "复购券",
    type: "再次预约",
    issued: 88,
    used: 39,
    scene: "完成开局后推动下一次到店",
  },
  {
    name: "工作日券",
    type: "时段激活",
    issued: 64,
    used: 21,
    scene: "提升非高峰时段包厢利用",
  },
  {
    name: "圈主券",
    type: "圈子活跃",
    issued: 32,
    used: 14,
    scene: "鼓励圈主邀请好友到店",
  },
];

export default function AdminCouponsPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/admin">
          返回老板首页
        </Link>
        <header className="mt-6">
          <p className="text-sm font-semibold text-[#9b7428]">卡券管理</p>
          <h1 className="mt-3 text-3xl font-semibold">复购权益配置</h1>
          <p className="mt-3 leading-7 text-[#4d665e]">
            查看卡券名称、类型、发放数、核销数与适用场景。
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {coupons.map((coupon) => (
            <article
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5"
              key={coupon.name}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{coupon.name}</h2>
                  <p className="mt-2 text-sm text-[#5d756d]">{coupon.type}</p>
                </div>
                <span className="rounded-full bg-[#f1dba5] px-3 py-1 text-xs font-semibold">
                  {coupon.scene}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label="发放数" value={`${coupon.issued} 张`} />
                <Metric label="核销数" value={`${coupon.used} 张`} />
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
