"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Props = {
  captionId: string;
  onVoted?: () => void;
  disabled?: boolean;
};

export default function CaptionVoteButtons({ captionId, onVoted, disabled }: Props) {
  const [submitting, setSubmitting] = useState<null | number>(null);
  const [votedValue, setVotedValue] = useState<null | number>(null);

  const vote = async (voteValue: number) => {
    if (disabled) return;

    try {
      setSubmitting(voteValue);

      const supabase = createClient();
      const { data, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const user = data.user;
      if (!user) {
        alert("You must be logged in to rate captions.");
        return;
      }

      const now = new Date().toISOString();

      const { error } = await supabase.from("caption_votes").insert({
        caption_id: captionId,
        profile_id: user.id,
        vote_value: voteValue,
        created_datetime_utc: now,
        modified_datetime_utc: now,
      });

      if (error) {
        // If already voted, count it as voted (prevents a stalemate)
        if (error.code === "23505") {
          setVotedValue(voteValue);
          onVoted?.();
          return;
        }
        throw error;
      }
      setVotedValue(voteValue);
      onVoted?.();
    } catch (e: any) {
      alert(e?.message ?? "Vote failed.");
    } finally {
      setSubmitting(null);
    }
  };

  const btnStyle = (forValue: number) => {
    const isVoted = votedValue === forValue;
    const isSubmitting = submitting === forValue;
    return {
      padding: "0.4rem 0.75rem",
      borderRadius: 12,
      border: `1px solid ${isVoted ? (forValue === 1 ? "#2563eb" : "#dc2626") : "#111"}`,
      background: isVoted ? (forValue === 1 ? "#2563eb" : "#dc2626") : isSubmitting ? "#eee" : "#fff",
      color: isVoted ? "#fff" : "#111",
      cursor: disabled || submitting !== null ? "not-allowed" : "pointer",
      fontWeight: 900 as const,
      opacity: disabled && !isVoted ? 0.6 : 1,
      transform: isVoted ? "scale(1.1)" : "scale(1)",
      transition: "all 150ms ease",
      boxShadow: isVoted ? `0 2px 8px ${forValue === 1 ? "#2563eb44" : "#dc262644"}` : "none",
    };
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
      <button
        onClick={() => vote(1)}
        disabled={disabled || submitting !== null}
        style={btnStyle(1)}
        title="Upvote"
      >
        👍
      </button>

      <button
        onClick={() => vote(-1)}
        disabled={disabled || submitting !== null}
        style={btnStyle(-1)}
        title="Downvote"
      >
        👎
      </button>
    </div>
  );
}