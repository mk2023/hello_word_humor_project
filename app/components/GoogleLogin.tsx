"use client";
import { createClient } from "@/lib/supabase/browser";

export default function GoogleLoginButton() {
  const signIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={signIn}
      style={{
        backgroundColor: "#e6f0ff",
        color: "#1f3a8a",
        padding: "1rem 1.75rem",
        borderRadius: 16,
        fontSize: "25px",
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      }}
    >
      Sign in with Google to View Memes
    </button>
  );
}
