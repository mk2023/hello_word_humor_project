import Image from "next/image";
import { createSupabaseClient } from "@/lib/supabase/supabaseServer";
import CaptionVoteButtons from "@/app/components/CaptionVoteButtons";

export default async function CaptionImagesData() {
  const supabase = await createSupabaseClient();

  // Get current logged-in user (server-side)
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) return <p>User lookup error: {userErr.message}</p>;

  const user = userRes.user;
  if (!user) return <p>You must be logged in.</p>;

  //only get the captions this user has alr voted on:
  const { data: voted_alr, error: votesError } = await supabase
      .from("caption_votes")
      .select("caption_id")
      .eq("profile_id", user.id);

  if(votesError){
    return <p>Vote lookup error: {votesError.message}</p>;
  }

  const votedCaptionIds = voted_alr?.map((v: any) => v.caption_id).filter(Boolean) ?? [];

  //fetch captions that were not voted previously
  let query = supabase
    .from("captions")
    .select("id, content, image_id, image:images(url)")
    .order("created_datetime_utc", {ascending: false});

  if(votedCaptionIds.length>0){
    const inList = `(${votedCaptionIds.map((id: string) => `"${id}"`).join(",")})`;
    query = query.not("id", "in", inList);
  }
  const { data: captions, error: captionsError } = await query;
  if (captionsError) {
    return <p>Caption Loading Error: {captionsError.message}</p>;
  }

  if (!captions?.length) {
    return <p>No captions left to vote on 🎉</p>;
  }

  return (
    <ul
    style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem", listStyle: "none", padding: 0, margin: "2rem 0", alignItems: "start"}}>
        {captions.map((row)=>{
                const rel = row.image as any;
                const url = Array.isArray(rel) ? rel[0]?.url : rel?.url;
                if (!url) return null;
                return(
                    <li key = {row.id}
                        style={{background: "#f2f2f2", borderRadius: 16, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", aspectRatio: "1/1"}}>
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
                           sizes="(max-width: 768px) 100vw, 280px"
                           style={{ objectFit: "cover" }}
                         />
                       </div>
                        <div>
                        </div>
                       <div style={{textAlign: "center", marginTop: "-0.4rem", paddingBottom: "0.25rem", fontSize:"15px", color: "#59656b", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"}}>
                            {row.content}
                       </div>
                       <CaptionVoteButtons captionId={row.id} />
                    </li>
                );
        })}
    </ul>
  );
}