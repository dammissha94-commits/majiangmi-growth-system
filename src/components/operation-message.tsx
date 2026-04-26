import type { ReactElement } from "react";

export type OperationMessageType = "error" | "info" | "success" | "warning";

export type OperationMessageProps = {
  description?: string;
  items?: string[];
  title: string;
  type: OperationMessageType;
};

const messageStyles: Record<
  OperationMessageType,
  { badge: string; border: string; title: string }
> = {
  error: {
    badge: "bg-[#7c2d12] text-[#fff8ea]",
    border: "border-[#b7892c]",
    title: "text-[#7c2d12]",
  },
  info: {
    badge: "bg-[#173f35] text-[#f1dba5]",
    border: "border-[#dbc99e]",
    title: "text-[#12332a]",
  },
  success: {
    badge: "bg-[#12332a] text-[#fff8ea]",
    border: "border-[#b7892c]",
    title: "text-[#12332a]",
  },
  warning: {
    badge: "bg-[#d3a443] text-[#12332a]",
    border: "border-[#d3a443]",
    title: "text-[#7a5a18]",
  },
};

const typeLabels: Record<OperationMessageType, string> = {
  error: "失败",
  info: "说明",
  success: "成功",
  warning: "提示",
};

export function OperationMessage({
  description,
  items,
  title,
  type,
}: OperationMessageProps): ReactElement {
  const styles = messageStyles[type];

  return (
    <section
      className={`mt-6 rounded-3xl border ${styles.border} bg-[#fff8ea] p-5 text-sm leading-7 text-[#4d665e]`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}
        >
          {typeLabels[type]}
        </span>
        <p className={`font-semibold ${styles.title}`}>{title}</p>
      </div>
      {description ? <p className="mt-3">{description}</p> : null}
      {items && items.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <p className="rounded-2xl bg-[#f7f1e6] px-4 py-2" key={item}>
              {item}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
