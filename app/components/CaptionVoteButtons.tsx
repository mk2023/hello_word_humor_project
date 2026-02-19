"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Props = {
  captionId: string;
};

export default function CaptionVoteButtons({ captionId }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<number | null>(null);

  const vote = async (voteValue: number) => {
    try {
      setSubmitting(true);

      const supabase = createClient();

      // Check logged-in user onoe more time
      const { data, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const user = data.user;
      if (!user) {
        alert("You must be logged in to rate captions.");
        return;
      }

      const now = new Date().toISOString();

      // Insert new vote row
      const { error } = await supabase.from("caption_votes").insert({
        caption_id: captionId,
        profile_id: user.id, // assuming profile_id = auth.uid()
        vote_value: voteValue,
        created_datetime_utc: now,
        modified_datetime_utc: now,
      });

      if (error) {
        if (error.code === "23505") {
          alert("You already rated this caption.");
          return;
        }
        throw error;
      }

      // Highlight vote button in this session
      setUserVote(voteValue);

    } catch (err: any) {
      alert(err?.message ?? "Vote failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const buttonStyle = (value: number) => ({
    padding: "0.4rem 0.75rem",
    borderRadius: 12,
    border: userVote === value ? "2px solid #1f3a8a" : "1px solid #111",
    background: userVote === value ? "#1f3a8a" : "#fff",
    color: userVote === value ? "#fff" : "#111",
    cursor: submitting ? "not-allowed" : "pointer",
    fontWeight: 800,
  });

  return (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
      <button
        onClick={() => vote(1)}
        disabled={submitting}
        style={buttonStyle(1)}
      >
        👍
      </button>

      <button
        onClick={() => vote(-1)}
        disabled={submitting}
        style={buttonStyle(-1)}
      >
        👎
      </button>
    </div>
  );
}
