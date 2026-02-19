"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Props = {
  captionId: string;
};

export default function CaptionVoteButtons({ captionId }: Props) {
  const [submitting, setSubmitting] = useState<null | number>(null);

  const vote = async (voteValue: number) => {
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
        profile_id: user.id,     // assuming profiles.id == auth.uid()
        vote_value: voteValue,   // 1 or -1
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
    } catch (e: any) {
      alert(e?.message ?? "Vote failed.");
    } finally {
      //make sure button is clickable again
      setSubmitting(null);
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
      <button
        onClick={() => vote(1)}
        disabled={submitting !== null}
        style={{
          padding: "0.4rem 0.75rem",
          borderRadius: 12,
          cursor: submitting !== null ? "not-allowed" : "pointer",
          background: "#fff",
          fontWeight: 800,
        }}
        title="Upvote"
      >
        👍
      </button>

      <button
        onClick={() => vote(-1)}
        disabled={submitting !== null}
        style={{
          padding: "0.4rem 0.75rem",
          borderRadius: 12,
          cursor: submitting !== null ? "not-allowed" : "pointer",
          background: "#fff",
          fontWeight: 800,
        }}
        title="Downvote"
      >
        👎
      </button>
    </div>
  );
}
