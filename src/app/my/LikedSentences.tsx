"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDeviceId } from "@/lib/device-id";
import {
  SENTENCE_WITH_LIKE_COUNT_SELECT,
  toSentenceCardData,
  type SentenceCardData,
} from "@/lib/sentences";
import { SentenceCard } from "@/components/SentenceCard";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; sentences: SentenceCardData[] };

export function LikedSentences() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const deviceId = getDeviceId();

      const { data: likeRows, error: likeError } = await supabase
        .from("likes")
        .select("sentence_id")
        .eq("device_id", deviceId);

      if (cancelled) return;
      if (likeError || !likeRows) {
        setState({ status: "error" });
        return;
      }

      const ids = [...new Set(likeRows.map((row) => row.sentence_id as string))];
      if (ids.length === 0) {
        setState({ status: "ready", sentences: [] });
        return;
      }

      const { data } = await supabase
        .from("sentences")
        .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
        .in("id", ids)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      setState({
        status: "ready",
        sentences: (data ?? []).map(toSentenceCardData),
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <p className="py-6 text-center font-mono text-sm text-stone">
        불러오는 중…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <p className="py-6 text-center font-mono text-sm text-stone">
        좋아요한 문장을 불러오지 못했어요.
      </p>
    );
  }

  if (state.sentences.length === 0) {
    return (
      <p className="py-6 text-center font-mono text-sm text-stone">
        아직 좋아요한 문장이 없어요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {state.sentences.map((sentence) => (
        <SentenceCard
          key={sentence.id}
          id={sentence.id}
          body={sentence.body}
          source={sentence.source}
          commentary={sentence.commentary}
          emotionTag={sentence.emotionTag}
          likeCount={sentence.likeCount}
        />
      ))}
    </div>
  );
}
