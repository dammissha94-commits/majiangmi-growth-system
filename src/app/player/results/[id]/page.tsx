import Link from "next/link";
import type { ReactNode } from "react";

import { incrementShareCountAction } from "./actions";
import { OperationMessage } from "@/components/operation-message";
import { getResultCardDetailsForPlayer } from "@/lib/services/result_card_service";

export const dynamic = "force-dynamic";

type ResultCardPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    shared?: string;
    share_count?: string;
    share_error?: string;
  }>;
};

export default async function ResultCardPage({
  params,
  searchParams,
}: ResultCardPageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const details = await getResultCardDetailsForPlayer(id);

  if (!details) {
    return <ResultShell>{renderEmptyState()}</ResultShell>;
  }

  const mvpResult =
    details.results.find((result) => result.is_mvp) ?? details.results[0];
  const isTestDemo = id === "test" && details.is_latest_demo;

  return (
    <ResultShell>
      <section className="mt-6 rounded-[2rem] border border-[#d3a443]/60 bg-[#173f35] p-5 shadow-2xl shadow-black/20">
        <div className="rounded-[1.5rem] bg-[#fff8ea] p-5 text-[#12332a]">
          <p className="text-sm font-semibold text-[#9b7428]">战绩海报</p>
          <h1 className="mt-3 text-3xl font-semibold">
            {details.result_card.card_title}
          </h1>
          <p className="mt-2 leading-7 text-[#4d665e]">
            {details.result_card.card_subtitle ?? "熟人局休闲记录"}
          </p>

          {isTestDemo ? (
            <p className="mt-4 rounded-2xl bg-[#f1dba5] p-4 text-sm font-semibold text-[#12332a]">
              当前为最新战绩海报演示。
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoCard
              label="门店名称"
              value={details.store?.name ?? "未设置门店"}
            />
            <InfoCard
              label="圈子名称"
              value={details.circle?.name ?? "未关联圈子"}
            />
            <InfoCard
              label="分享次数"
              value={`${details.result_card.share_count} 次`}
            />
            <InfoCard
              label="生成时间"
              value={formatDateTime(details.result_card.generated_at)}
            />
            <InfoCard
              label="牌局状态"
              value={details.game?.status ?? "未设置"}
            />
            <InfoCard
              label="MVP 玩家"
              value={mvpResult?.user?.display_name ?? "暂无"}
            />
          </div>

          <div className="mt-5 grid gap-3 text-sm text-[#f1dba5] md:grid-cols-2">
            <p className="rounded-2xl bg-[#12332a] p-4">
              娱乐积分，仅作休闲记录。
            </p>
            <p className="rounded-2xl bg-[#12332a] p-4">
              当前页面仅展示战绩海报，不提供任何玩家间结算能力。
            </p>
          </div>

          <section className="mt-5">
            <h2 className="text-xl font-semibold">参与玩家结果</h2>
            {details.results.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-[#e1cfaa] bg-[#f7f1e6] p-4 text-sm leading-7 text-[#4d665e]">
                暂无娱乐积分结果。
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {details.results.map((result) => (
                  <article
                    className={`grid gap-3 rounded-2xl border p-4 sm:grid-cols-[1fr_auto] ${
                      result.is_mvp
                        ? "border-[#b7892c] bg-[#f1dba5]"
                        : "border-[#e1cfaa] bg-[#f7f1e6]"
                    }`}
                    key={result.id}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold">
                          {result.user?.display_name ?? "未命名用户"}
                        </p>
                        {result.is_mvp ? (
                          <span className="rounded-full bg-[#12332a] px-3 py-1 text-xs font-semibold text-[#fff8ea]">
                            MVP
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-[#5d756d]">
                        rank {result.rank}
                      </p>
                      <p className="mt-2 text-sm text-[#5d756d]">
                        备注：{result.note ?? "无"}
                      </p>
                    </div>
                    <p className="text-2xl font-semibold text-[#9b7428]">
                      {result.entertainment_score}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          {sp.shared === "1" ? (
            <OperationMessage
              description={`当前分享次数：${sp.share_count ?? details.result_card.share_count} 次`}
              title="海报已分享"
              type="success"
            />
          ) : null}

          {sp.share_error ? (
            <OperationMessage
              description={sp.share_error}
              title="分享失败"
              type="error"
            />
          ) : null}
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        <StaticActionButton>保存海报</StaticActionButton>
        <form action={incrementShareCountAction}>
          <input
            name="result_card_id"
            type="hidden"
            value={details.result_card.id}
          />
          <button
            className="w-full rounded-full bg-[#d3a443] px-5 py-3 text-center text-sm font-semibold text-[#12332a] transition hover:bg-[#e5bd67]"
            type="submit"
          >
            邀请好友
          </button>
        </form>
        <StaticActionButton>预约下一局</StaticActionButton>
      </section>
    </ResultShell>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type InfoCardProps = {
  label: string;
  value: string;
};

function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-[#e1cfaa] bg-[#f7f1e6] p-4">
      <p className="text-sm text-[#5d756d]">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function StaticActionButton({ children }: { children: ReactNode }) {
  return (
    <button
      className="rounded-full bg-[#d3a443] px-5 py-3 text-center text-sm font-semibold text-[#12332a]"
      type="button"
    >
      {children}
    </button>
  );
}

function ResultShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#12332a] px-5 py-8 text-[#fff8ea]">
      <div className="mx-auto max-w-4xl">
        <Link className="text-sm font-medium text-[#f1dba5]" href="/player">
          返回玩家中心
        </Link>
        {children}
      </div>
    </main>
  );
}

function renderEmptyState() {
  return (
    <section className="mt-6 rounded-[2rem] border border-[#d3a443]/60 bg-[#173f35] p-6">
      <p className="text-sm font-semibold text-[#f1dba5]">战绩海报</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无战绩海报数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#e8dbc4]">
        当前还没有可展示的战绩海报。完成娱乐积分记录并生成海报后，此页会展示真实数据。
      </p>
    </section>
  );
}
