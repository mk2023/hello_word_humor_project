import Image from "next/image";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase/supabaseServer";
import CaptionBatchClient from "@/app/components/CaptionBatchRefresh";
const PAGE_SIZE = 3;

export default async function CaptionImagesData(props: { page?: number }) {
 const supabase = await createSupabaseClient();

  // get current logged-in user (server-side)
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) return <p>User lookup error: {userErr.message}</p>;

  const user = userRes.user;
  if (!user) return <p>You must be logged in.</p>;

  // get caption IDs this user has already voted on
  const { data: voted_alr, error: votesError } = await supabase
    .from("caption_votes")
    .select("caption_id")
    .eq("profile_id", user.id);

  if (votesError) {
    return <p>Vote lookup error: {votesError.message}</p>;
  }

  const votedCaptionIds =
    voted_alr?.map((v: any) => v.caption_id).filter(Boolean) ?? [];

  // get captions excluding voted ones
  let query = supabase
    .from("captions")
    .select("id, content, image_id, image:images(url)", { count: "exact" })
    .order("created_datetime_utc", { ascending: false });

  if (votedCaptionIds.length > 0) {
    const inList = `(${votedCaptionIds
      .map((id: string) => `"${id}"`)
      .join(",")})`;
    query = query.not("id", "in", inList);
  }

  const { data: captions, error: captionsError, count } = await query.limit(PAGE_SIZE);

  if (captionsError) {
    return <p>Caption Loading Error: {captionsError.message}</p>;
  }

  if (!captions?.length) {
    return <p>No captions left to vote on!</p>;
  }

  return (
    <div style={{ width: "min(1100px, 100%)", margin: "0 auto" }}>
      <div style={{ fontWeight: 900, margin: "1rem 0" }}>
         Vote on all 3 to load the next set!
      </div>

      <CaptionBatchClient captions={captions as any} />
    </div>
  );
}