import { Suspense } from "react";
import CaptionImagesData from "@/app/components/CaptionImagesData";
import LoggedInUserBox from "@/app/components/LoggedInUserBox";
export const dynamic = "force-dynamic";

export default function ProtectedPage() {
  return (
    <main style={{ padding: "2.5rem clamp(1.5rem, 5vw, 4rem)" }}>
      <LoggedInUserBox />

      <h1 style={{ fontSize: "3.5rem", fontWeight: 800 }}>
        Memes to Vote On!
      </h1>

      <Suspense fallback={<div>Loading memes...</div>}>
        <CaptionImagesData />
      </Suspense>
    </main>
  );
}
