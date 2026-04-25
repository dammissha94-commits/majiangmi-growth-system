import { createGameDraftAction } from "./actions";
import { listRecentGameDrafts } from "@/lib/services/game_service";

export const dynamic = "force-dynamic";

export default async function NewGamePage() {
  const recentGames = await listRecentGameDrafts();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-500">玩家端</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            创建牌局草稿
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            当前版本只创建牌局草稿，只写入 games 表。不会添加参与玩家，不会保存娱乐积分，不会生成战绩海报，不涉及登录、权限、支付或结算。
          </p>
        </div>

        <form action={createGameDraftAction} className="grid gap-5">
          <div className="grid gap-2">
            <label
              htmlFor="store_id"
              className="text-sm font-medium text-slate-700"
            >
              门店 ID，可留空
            </label>
            <input
              id="store_id"
              name="store_id"
              type="text"
              placeholder="留空时自动使用第一条测试门店"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
            <p className="text-xs text-slate-500">
              开发库无登录模式下，留空会读取 stores 表第一条门店作为 store_id。
            </p>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="game_count"
              className="text-sm font-medium text-slate-700"
            >
              局数
            </label>
            <input
              id="game_count"
              name="game_count"
              type="number"
              min="1"
              defaultValue="1"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <p>写入规则：</p>
            <p>status = created</p>
            <p>game_count 默认 1</p>
            <p>只写 games 表</p>
          </div>

          <button
            type="submit"
            className="w-fit rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white"
          >
            创建牌局草稿
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">最近牌局草稿</h2>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">创建时间</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">局数</th>
                <th className="px-4 py-3 font-medium">门店 ID</th>
              </tr>
            </thead>
            <tbody>
              {recentGames.map((game) => (
                <tr key={game.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 text-slate-700">
                    {new Date(game.created_at).toLocaleString("zh-CN")}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{game.status}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {game.game_count}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {game.store_id}
                  </td>
                </tr>
              ))}

              {recentGames.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    暂无牌局草稿
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
