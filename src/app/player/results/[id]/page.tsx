import Link from "next/link";

const ranking = [
  { name: "林晨", rank: "第 1 名", score: "+36", badge: "MVP" },
  { name: "晴姐", rank: "第 2 名", score: "+12", badge: "稳定发挥" },
  { name: "阿杰", rank: "第 3 名", score: "-8", badge: "下局再来" },
  { name: "小满", rank: "第 4 名", score: "-40", badge: "气氛担当" },
];

export default function ResultCardPage() {
  return (
    <main className="min-h-screen bg-[#12332a] px-5 py-8 text-[#fff8ea]">
      <div className="mx-auto max-w-4xl">
        <Link className="text-sm font-medium text-[#f1dba5]" href="/player">
          返回玩家中心
        </Link>

        <section className="mt-6 rounded-[2rem] border border-[#d3a443]/60 bg-[#173f35] p-5 shadow-2xl shadow-black/20">
          <div className="rounded-[1.5rem] bg-[#fff8ea] p-5 text-[#12332a]">
            <p className="text-sm font-semibold text-[#9b7428]">战绩海报</p>
            <h1 className="mt-3 text-3xl font-semibold">麻将迷社区棋牌室</h1>
            <p className="mt-2 text-[#4d665e]">周五老友局</p>
            <p className="mt-5 rounded-2xl bg-[#12332a] p-4 text-sm text-[#f1dba5]">
              娱乐积分，仅作休闲记录。
            </p>

            <div className="mt-5 grid gap-3">
              {ranking.map((item) => (
                <div
                  className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-[#e1cfaa] bg-[#f7f1e6] p-4"
                  key={item.name}
                >
                  <div>
                    <p className="text-lg font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-[#5d756d]">
                      {item.rank} · {item.badge}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-[#9b7428]">
                    {item.score}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[#d3a443] bg-[#fbf6ea] p-4">
              <p className="text-sm text-[#5d756d]">MVP</p>
              <p className="mt-2 text-2xl font-semibold">林晨</p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            className="rounded-full bg-[#d3a443] px-5 py-3 text-center text-sm font-semibold text-[#12332a]"
            href="/player/circles"
          >
            分享邀请好友
          </Link>
          <Link
            className="rounded-full border border-[#f1dba5] px-5 py-3 text-center text-sm font-semibold text-[#fff8ea]"
            href="/player/reservations/new"
          >
            预约下一局
          </Link>
        </section>
      </div>
    </main>
  );
}
