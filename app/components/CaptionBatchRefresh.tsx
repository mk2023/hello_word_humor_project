"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CaptionVoteButtons from "@/app/components/CaptionVoteButtons";

type CaptionRow = {
  id: string;
  content: string;
  image: any;
};

export default function CaptionBatchClient({ captions }: { captions: CaptionRow[] }) {
  const router = useRouter();

  // Track voted caption ids in the current page
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const totalInBatch = captions.length;

  // Reset vote tracking when there is a new batch
  useEffect(() => {
    setVotedIds(new Set());
  }, [captions]);

  // When votedIds==totalInBatch, refresh safely
  useEffect(() => {
    if (totalInBatch > 0 && votedIds.size >= totalInBatch) {
      const t = setTimeout(() => {
        router.refresh();
      }, 150);

      return () => clearTimeout(t);
    }
  }, [votedIds, totalInBatch, router]);

  //when a vote is made
  const handleVoted = (captionId: string) => {
    setVotedIds((prev) => {
      if (prev.has(captionId)) return prev;

      const next = new Set(prev);
      next.add(captionId);
      return next;
    });
  };

  return (
    <ul
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1.5rem",
        listStyle: "none",
        padding: 0,
        margin: "0 auto 2rem auto",
        maxWidth: "1100px",
        width: "100%",
        alignItems: "start",
      }}
    >
      {captions.map((row) => {
        const rel = row.image as any;
        const url = Array.isArray(rel) ? rel[0]?.url : rel?.url;
        if (!url) return null;

        const votedThisOne = votedIds.has(row.id);

        return (
          <li
            key={row.id}
            style={{
              background: votedThisOne ? "#e6f0ff" : "#f2f2f2",
              borderRadius: 16,
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              opacity: votedThisOne ? 0.85 : 1,
              transition: "opacity 120ms ease",
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "4/3",
                borderRadius: 12,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Image
                src={url}
                alt={row.content}
                fill
                sizes="(max-width: 768px) 100vw, 350px"
                style={{ objectFit: "cover" }}
              />
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: "15px",
                color: "#59656b",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {row.content}
            </div>

            <CaptionVoteButtons
              captionId={row.id}
              onVoted={() => handleVoted(row.id)}
              disabled={votedThisOne}
            />

            {votedThisOne && (
              <div style={{ textAlign: "center", fontSize: 12, opacity: 0.75 }}>
                Vote Registered ✅
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}