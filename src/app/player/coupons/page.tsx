import Link from "next/link";

const coupons = [
  {
    name: "新人券",
    scene: "首次加入门店会员后可用",
    status: "待使用",
  },
  {
    name: "复购券",
    scene: "完成本周开局后可用",
    status: "待预约",
  },
  {
    name: "工作日券",
    scene: "周一至周四非高峰时段可用",
    status: "可领取",
  },
  {
    name: "圈主券",
    scene: "圈主邀请好友到店后可用",
    status: "待激活",
  },
];

export default function PlayerCouponsPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/player">
          返回玩家中心
        </Link>
        <header className="mt-6">
          <p className="text-sm font-semibold text-[#9b7428]">我的卡券</p>
          <h1 className="mt-3 text-3xl font-semibold">领取复购权益</h1>
          <p className="mt-3 leading-7 text-[#4d665e]">
            用卡券推动再次预约，连接熟人圈活跃与门店复购。
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {coupons.map((coupon) => (
            <article
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5 shadow-sm"
              key={coupon.name}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{coupon.name}</h2>
                  <p className="mt-3 leading-7 text-[#4d665e]">
                    {coupon.scene}
                  </p>
                </div>
                <span className="rounded-full bg-[#f1dba5] px-3 py-1 text-xs font-semibold text-[#12332a]">
                  {coupon.status}
                </span>
              </div>
              <Link
                className="mt-5 block rounded-full border border-[#b7892c] px-4 py-3 text-center text-sm font-semibold"
                href="/player/reservations/new"
              >
                去预约
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
