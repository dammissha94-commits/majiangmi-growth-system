import Link from "next/link";

const circles = ["周五老友局", "邻里轻松局", "午后休闲局"];
const players = ["林晨", "阿杰", "小满", "晴姐"];

export default function NewGamePage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/player">
          返回玩家中心
        </Link>
        <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
          <p className="text-sm font-semibold text-[#f1dba5]">快速开局</p>
          <h1 className="mt-3 text-3xl font-semibold">选择圈子与玩家</h1>
          <p className="mt-3 leading-7 text-[#e8dbc4]">
            本页为静态开局骨架，娱乐积分，仅作休闲记录。
          </p>
        </header>

        <section className="mt-6 grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
            <h2 className="text-xl font-semibold">选择圈子</h2>
            <div className="mt-4 space-y-3">
              {circles.map((circle, index) => (
                <button
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium ${
                    index === 0
                      ? "border-[#b7892c] bg-[#f1dba5]"
                      : "border-[#e1cfaa] bg-[#f7f1e6]"
                  }`}
                  key={circle}
                  type="button"
                >
                  {circle}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
            <h2 className="text-xl font-semibold">4 名玩家</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {players.map((player, index) => (
                <div
                  className="rounded-2xl border border-[#e1cfaa] bg-[#f7f1e6] p-4"
                  key={player}
                >
                  <p className="text-sm text-[#5d756d]">玩家 {index + 1}</p>
                  <p className="mt-2 text-xl font-semibold">{player}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">娱乐积分录入入口</h2>
              <p className="mt-2 leading-7 text-[#4d665e]">
                开局后可记录名次与娱乐积分，仅作休闲记录。
              </p>
            </div>
            <button
              className="rounded-full bg-[#d3a443] px-5 py-3 text-sm font-semibold text-[#12332a]"
              type="button"
            >
              准备记录
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
