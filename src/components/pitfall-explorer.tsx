"use client";

import { useMemo, useState } from "react";
import type { Pitfall, PitfallCategory } from "@/lib/pitfalls";

type Props = {
  items: Pitfall[];
  categories: { name: PitfallCategory; count: number }[];
};

const langLabel: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  json: "JSON",
  css: "CSS",
};

export function PitfallExplorer({ items, categories }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PitfallCategory | "全部">("全部");

  const filtered = useMemo(() => {
    const kw = query.trim().toLowerCase();
    return items.filter((p) => {
      if (category !== "全部" && p.category !== category) return false;
      if (!kw) return true;
      return [p.title, p.symptom, p.cause, p.solution, p.code ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(kw);
    });
  }, [items, query, category]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索报错信息、关键字…"
          className="w-full rounded border border-line bg-card px-3 py-2 text-sm outline-none focus:border-accent"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("全部")}
            className={
              category === "全部"
                ? "rounded bg-accent px-3 py-1 text-xs text-white"
                : "rounded border border-line px-3 py-1 text-xs text-muted hover:text-fg"
            }
          >
            全部（{items.length}）
          </button>
          {categories.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setCategory(c.name)}
              className={
                category === c.name
                  ? "rounded bg-accent px-3 py-1 text-xs text-white"
                  : "rounded border border-line px-3 py-1 text-xs text-muted hover:text-fg"
              }
            >
              {c.name}（{c.count}）
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted">
        共 {filtered.length} 条
        {filtered.length !== items.length ? `（已从 ${items.length} 条中筛选）` : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded border border-line p-6 text-center text-sm text-muted">
          没有匹配的条目，换个关键字试试。
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((p) => (
            <li key={p.id} className="theme-card rounded border p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded border border-line px-2 py-0.5 text-xs text-accent">
                  {p.category}
                </span>
                <h2 className="font-medium">{p.title}</h2>
              </div>

              <details className="group">
                <summary className="cursor-pointer text-sm text-muted hover:text-fg">
                  查看原因与解决方案
                </summary>

                <div className="mt-3 space-y-3 text-sm">
                  <section>
                    <h3 className="mb-1 text-xs font-medium text-muted">症状</h3>
                    <pre className="overflow-x-auto rounded bg-black/5 p-2 text-xs whitespace-pre-wrap dark:bg-white/10">
                      {p.symptom}
                    </pre>
                  </section>

                  <section>
                    <h3 className="mb-1 text-xs font-medium text-muted">原因</h3>
                    <p className="text-fg">{p.cause}</p>
                  </section>

                  <section>
                    <h3 className="mb-1 text-xs font-medium text-muted">解决</h3>
                    <p className="text-fg">{p.solution}</p>
                  </section>

                  {p.code ? (
                    <section>
                      <h3 className="mb-1 flex items-center gap-2 text-xs font-medium text-muted">
                        代码
                        {p.lang ? (
                          <span className="rounded border border-line px-1.5 py-0.5 text-[10px]">
                            {langLabel[p.lang] ?? p.lang}
                          </span>
                        ) : null}
                      </h3>
                      <pre className="theme-card overflow-x-auto rounded border p-3 text-xs leading-relaxed">
                        <code>{p.code}</code>
                      </pre>
                    </section>
                  ) : null}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
