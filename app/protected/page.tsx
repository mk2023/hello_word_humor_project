import { Suspense } from "react";
import LoggedInUserBox from "@/app/components/LoggedInUserBox";
import CaptionImagesData from "@/app/components/CaptionImagesData";
import UploadCaptions from "@/app/components/UploadCaptions";

export const dynamic = "force-dynamic";

type SP = {
  mode?: string;
};

export default async function ProtectedPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const mode = sp.mode === "upload" ? "upload" : "vote";

  return (
    <main style={{ padding: "2.5rem clamp(1.5rem, 5vw, 4rem)" }}>
      <LoggedInUserBox />

      <h1 style={{ fontSize: "3.5rem", fontWeight: 800 }}>Memes!</h1>

      <div style={{ display: "flex", gap: 12, margin: "1rem 0" }}>
        <a
          href="/protected?mode=vote"
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 14,
            border: "2px solid #111",
            fontWeight: 900,
            textDecoration: "none",
            background: mode === "vote" ? "#111" : "#fff",
            color: mode === "vote" ? "#fff" : "#111",
            display: "inline-block",
          }}
        >
          Vote
        </a>

        <a
          href="/protected?mode=upload"
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 14,
            border: "2px solid #111",
            fontWeight: 900,
            textDecoration: "none",
            background: mode === "upload" ? "#111" : "#fff",
            color: mode === "upload" ? "#fff" : "#111",
            display: "inline-block",
          }}
        >
          Upload
        </a>
      </div>

      {mode === "upload" ? (
        <UploadCaptions />
      ) : (
        <Suspense fallback={<div>Loading memes...</div>}>
          <CaptionImagesData />
        </Suspense>
      )}

    </main>
  );
}