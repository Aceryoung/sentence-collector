"use client";

import { useState } from "react";
import { MyArchive } from "./MyArchive";
import { LikedSentences } from "./LikedSentences";
import { MyThoughts } from "./MyThoughts";
import { MyJourney, type JourneyData } from "./MyJourney";

type TabKey = "sentences" | "liked" | "thoughts" | "journey";

const TABS: { key: TabKey; label: string }[] = [
  { key: "sentences", label: "내 문장" },
  { key: "liked", label: "좋아요" },
  { key: "thoughts", label: "내 생각" },
  { key: "journey", label: "여정" },
];

type Props = {
  sentences: Parameters<typeof MyArchive>[0]["sentences"];
  myThoughts: Parameters<typeof MyThoughts>[0]["thoughts"];
  recap: {
    sentenceCountThisPeriod: number;
    totalLikes: number;
    topSentence: { body: string } | null;
  };
  journeyData: JourneyData;
};

export function MyLibraryTabsClient({ sentences, myThoughts, recap, journeyData }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("sentences");

  return (
    <div className="flex flex-col gap-4">
      {/* 탭 네비게이션 */}
      <div className="flex gap-1 overflow-x-auto border-b border-hairline scrollbar-none" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative shrink-0 px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
              activeTab === tab.key
                ? "text-cta"
                : "text-stone hover:text-ink active:scale-95"
            }`}
          >
            {tab.label}
            {activeTab === tab.key ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-cta" />
            ) : null}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div role="tabpanel">
        {activeTab === "sentences" ? (
          <MyArchive sentences={sentences} />
        ) : activeTab === "liked" ? (
          <LikedSentences />
        ) : activeTab === "thoughts" ? (
          <MyThoughts thoughts={myThoughts} />
        ) : (
          <MyJourney data={journeyData} />
        )}
      </div>
    </div>
  );
}
