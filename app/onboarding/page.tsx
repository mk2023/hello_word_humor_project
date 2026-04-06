import { redirect } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/supabaseServer";
import LoggedInUserBox from "@/app/components/LoggedInUserBox";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createSupabaseClient();
  const { data: userRes, error } = await supabase.auth.getUser();
  if (error || !userRes?.user) redirect("/");

  return (
    <main style={{ minHeight: "100vh", padding: "2rem clamp(1.2rem, 4vw, 3rem)" }}>
      <LoggedInUserBox />

      <section
        style={{
          maxWidth: 920,
          margin: "0 auto",
          background: "#fff",
          border: "2px solid #111",
          borderRadius: 22,
          padding: "1.4rem",
          boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: "2.1rem", fontWeight: 900, marginBottom: 10 }}>
          Welcome! Help us train meme AI
        </h1>

        <p style={{ fontSize: 16, lineHeight: 1.6, fontWeight: 600 }}>
          We are training an AI to create funny memes, and this app collects feedback data
          to improve that model.
        </p>

        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: 8 }}>1) Voting</h2>
          <p style={{ lineHeight: 1.65 }}>
            The voting feature gives feedback on AI-generated captions. Please vote based on
            how well the caption matches the image, whether it is funny, and overall meme quality.
          </p>
        </div>

        <div style={{ marginTop: 12 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: 8 }}>2) Uploading</h2>
          <p style={{ lineHeight: 1.65 }}>
            If you would like to contribute more, upload your own image and test how the AI
            generates captions. The generated captions are saved in our backend database, and
            other users can vote on them.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <a
            href="/protected?mode=vote"
            style={{
              padding: "0.7rem 1rem",
              borderRadius: 14,
              border: "2px solid #111",
              textDecoration: "none",
              background: "#111",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            Start Voting
          </a>
          <a
            href="/protected?mode=upload"
            style={{
              padding: "0.7rem 1rem",
              borderRadius: 14,
              border: "2px solid #111",
              textDecoration: "none",
              background: "#fff",
              color: "#111",
              fontWeight: 900,
            }}
          >
            Try Uploading
          </a>
        </div>
      </section>
    </main>
  );
}
