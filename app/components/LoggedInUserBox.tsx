"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export default function LoggedInUserBox() {
  const [email, setEmail] = useState<string>(""); // stable first render
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, []);

  const logout = async () => {
    try {
      setSigningOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();

      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "1.25rem",
        right: "1.25rem",
        padding: "0.6rem 0.9rem",
        border: "2px solid #111",
        borderRadius: 12,
        background: "#fff",
        zIndex: 1000,
        minWidth: 220,
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>Logged in as</div>
      <div style={{ fontWeight: 800 }}>{email || "Loading..."}</div>
      <button
        onClick={logout}
        disabled={signingOut || !email}
        style={{
          width: "100%",
          padding: "0.45rem 0.6rem",
          borderRadius: 10,
          border: "1px solid #111",
          background: "#fff",
          cursor: signingOut ? "not-allowed" : "pointer",
          fontWeight: 800,
        }}
      >
        {signingOut ? "Signing out..." : "Log out"}
      </button>
    </div>
  );
}
