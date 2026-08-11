import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarkAllReadButton } from "./MarkAllReadButton";

const TYPE_ICONS: Record<string, string> = {
  like: "♥",
  reflection: "💬",
  challenge: "🏆",
  system: "📢",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const items = notifications ?? [];
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold text-ink">알림</h1>
        {unreadCount > 0 ? (
          <div className="flex items-center gap-3">
            <span className="rounded-[var(--radius-pill)] bg-archive/10 px-2.5 py-0.5 text-xs text-archive">
              {unreadCount}개 안 읽음
            </span>
            <MarkAllReadButton />
          </div>
        ) : null}
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col">
          {items.map((n) => (
            <li
              key={n.id}
              className={`flex gap-3 border-b border-hairline px-2 py-4 ${
                n.read ? "opacity-60" : ""
              }`}
            >
              <span className="shrink-0 text-lg" aria-hidden="true">
                {TYPE_ICONS[n.type] ?? "📢"}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {n.link ? (
                  <Link
                    href={n.link}
                    className="font-semibold text-ink hover:text-archive"
                  >
                    {n.title}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">{n.title}</span>
                )}
                {n.body ? (
                  <p className="user-text text-sm text-stone">{n.body}</p>
                ) : null}
                <time className="text-xs text-stone-faint">
                  {new Date(n.created_at).toLocaleDateString("ko-KR")}
                </time>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-16 text-center text-sm text-stone">
          아직 알림이 없어요.
        </p>
      )}

      <Link
        href="/"
        className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 홈으로 돌아가기
      </Link>
    </main>
  );
}
