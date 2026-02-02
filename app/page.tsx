import Image from "next/image";
import { createSupabaseClient } from "@/lib/supabase/supabaseServer";
import { Suspense } from "react";

async function CaptionExamplesData() {
  const supabase = await createSupabaseClient();
  const { data: caption_examples, error } = await supabase.from("caption_examples").select().order("created_datetime_utc", {ascending: false});

  if (error){
    return <p> Caption Loading Error </p>;
  }
  return (
    <ul>
        {caption_examples.map((row)=>(
            <li key = {row.id} style = {{marginBottom: "0.75rem", marginLeft: "0.85rem"}}>
                {row.caption}
            </li>
        ))}
    </ul>
  );
}

export default function Home() {
  return (
    <main>
        <h1 style = {{fontSize: "3rem"}}>Hello!</h1>
         <h1 style = {{fontSize: "3rem"}}>Printing all the caption examples ordered by the date they were made! (newest to oldest) </h1>
         <Suspense fallback={<div>Loading caption_examples...</div>}>
           <CaptionExamplesData />
         </Suspense>
    </main>
  );
}