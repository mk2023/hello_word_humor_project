import Image from "next/image";
import { createSupabaseClient } from "@/lib/supabase/supabaseServer";
import { Suspense } from "react";

async function CaptionExamplesData() {
  const supabase = await createSupabaseClient();
  const { data: captions, error: captionsError } = await supabase.from("captions").select('id, content, image_id, images(url)').order("created_datetime_utc", {ascending: false});

  if (captionsError) {
    return <p>Caption Loading Error: {captionsError.message}</p>;
  }

  if(!captions?.length){
    return <p>No captions are found.</p>
  }

  const rows = (captions??[]).filter((row)=>{
    const rel = row.images;
    if(Array.isArray(rel)) return Boolean(rel[0]?.url);
    return Boolean(rel?.url);
  });

  return (
    <ul
    style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem", listStyle: "none", padding: 0, margin: "2rem 0", alignItems: "start"}}>
        {rows.map((row)=>{
                return(
                    <li key = {row.id}
                        style={{background: "#f2f2f2", borderRadius: 16, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", aspectRatio: "1/1"}}>
                       <div style = {{flex: 1, width: "100%", borderRadius: 12, overflow: "hidden"}}>
                          <Image src = {row.images.url}
                          alt = {row.content}
                          width={600}
                          height={600}
                          style = {{width: "100%", height: "auto", objectFit: "cover"}}
                          />
                       </div>
                       <br/>
                       <div style={{textAlign: "center", fontSize:"0.95rem", color: "#59656b", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"}}>
                            {row.content}
                       </div>
                    </li>
                );
        })}
    </ul>
  );
}

export default function Home() {
  return (
    <main style={{ padding: "2.5rem clamp(1.5rem, 5vw, 4rem)" }}>
        <h1 style = {{fontSize: "5rem", }}>Hello World!</h1>
         <h1 style = {{fontSize: "3rem"}}>Printing all the caption examples ordered by the date they were made! (newest to oldest) </h1>
         <Suspense fallback={<div>Loading caption_examples...</div>}>
           <CaptionExamplesData />
         </Suspense>
    </main>
  );
}