import GoogleLoginButton from "@/app/components/GoogleLogin";

export const dynamic = "force-dynamic";

export default async function Home() {

  return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <GoogleLoginButton />
      </main>
    );
}