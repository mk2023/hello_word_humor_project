import { createSupabaseClient } from "@/lib/supabase/supabaseServer";
import CaptionBatchClient from "@/app/components/CaptionBatchRefresh";

const BATCH_SIZE = 3;
const PREFETCH = 60; // fetch extra so filtering still leaves enough

export default async function CaptionImagesData() {
  const supabase = await createSupabaseClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) return <p>User lookup error: {userErr.message}</p>;

  const user = userRes.user;
  if (!user) return <p>You must be logged in.</p>;

  // read votes for this user
  const { data: votes, error: votesErr } = await supabase
    .from("caption_votes")
    .select("caption_id")
    .eq("profile_id", user.id);

  if (votesErr) return <p>Vote lookup error: {votesErr.message}</p>;

  const votedSet = new Set((votes ?? []).map((v: any) => v.caption_id).filter(Boolean));

  // fetch captions
  const { data: captionsRaw, error: captionsErr } = await supabase
    .from("captions")
    .select("id, content, image:images(url)")
    .order("created_datetime_utc", { ascending: false })
    .limit(PREFETCH);

  if (captionsErr) return <p>Caption Loading Error: {captionsErr.message}</p>;

 //get captions we have not previously voted on
  const remaining = (captionsRaw ?? []).filter((c: any) => !votedSet.has(c.id));
  const batch = remaining.slice(0, BATCH_SIZE);

  if (batch.length === 0) return <p>No captions left to vote on 🎉</p>;

  return <CaptionBatchClient captions={batch} />;
}