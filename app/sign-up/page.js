import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#080b12",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg,#00ffa3,#00c27a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#080b12", fontSize: "18px" }}>P</div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "20px", fontWeight: "700", color: "#fff" }}>PitchSense</span>
        </div>
        <div style={{ fontSize: "13px", color: "#475569" }}>Start your free 14-day trial</div>
      </div>
      <SignUp />
    </div>
  );
}
