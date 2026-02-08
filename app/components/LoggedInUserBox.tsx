"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function LoggedInUserBox() {
  const [email, setEmail] = useState<string>(""); // stable first render

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, []);

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
    </div>
  );
}
