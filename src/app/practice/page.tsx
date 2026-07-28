import { createClient } from "@/lib/supabase/server";
import { getPublicDailyPick } from "@/lib/sentences";

export default async function PracticePage() {
  const supabase = await createClient();
  const sentence = await getPublicDailyPick(supabase);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center gap-10 px-4 py-16">
      <span className="font-mono text-xs text-stone">오늘의 필사</span>
      {sentence ? (
        <div className="flex flex-col items-center gap-8 text-center">
          <p className="font-serif text-2xl leading-loose text-ink text-balance">
            {sentence.body}
          </p>
          <span className="border border-hairline-strong px-3 py-1 font-mono text-sm text-stone">
            {sentence.source || "출처 미상"}
          </span>
        </div>
      ) : (
        <p className="text-center font-mono text-sm text-stone">
          아직 필사할 문장이 없어요. 첫 문장을 등록해보세요.
        </p>
      )}
    </main>
  );
}
