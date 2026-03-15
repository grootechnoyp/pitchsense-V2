"use client";
import "./globals.css";
import Link from "next/link";
import { useState, useEffect } from "react";

const WHISPERS = [
  { signal: "💰 Price Objection", text: '"Anchor to ROI: Our avg customer saves $4,200/mo. That\'s 14x in month one."' },
  { signal: "🔥 Buying Signal",   text: '"They\'re imagining ownership. Ask: Should we map out an implementation timeline?"' },
  { signal: "⏱ Stall Detected",   text: '"Surface the real objection: On a scale of 1–10, how close are we?"' },
  { signal: "👔 Authority Gap",    text: '"Map the decision: If your manager were here, what would be her top concern?"' },
];

const FEATURES = [
  { icon: "🎧", title: "Live AI Whispers", desc: "Claude listens and whispers the perfect response in real-time — before the prospect loses interest." },
  { icon: "⚡", title: "Instant Objection Counter", desc: "Price, timing, authority — every objection type is detected and countered with exact words to say." },
  { icon: "📊", title: "Call Scoring", desc: "Every call gets a full debrief: score, top moment, biggest miss, and one tip to improve next time." },
  { icon: "📖", title: "Self-Building Playbook", desc: "Your best moves are automatically saved as plays. Your playbook compounds with every call." },
  { icon: "🧠", title: "Buying Signal Detection", desc: "Catch every 'we could', 'what if', and 'when can we' — and close before the moment passes." },
  { icon: "📈", title: "Performance History", desc: "Track your score, close rate, and signal trends across every call over time." },
];

const PRICING = [
  {
    name: "Solo", price: "$49", period: "/mo",
    features: ["Unlimited calls", "Live AI whispers", "Call scoring", "Playbook builder", "30-day history"],
    cta: "Start Free Trial", highlight: false,
  },
  {
    name: "Pro", price: "$99", period: "/mo",
    features: ["Everything in Solo", "Team dashboard", "CRM integrations", "Priority AI speed", "Unlimited history", "Email summaries"],
    cta: "Start Free Trial", highlight: true,
  },
];

const TESTIMONIALS = [
  { name: "Marcus T.", role: "SaaS AE", text: "Closed a $24k deal I was about to lose. PitchSense caught the buying signal I completely missed.", score: "82 → 94" },
  { name: "Priya K.", role: "Freelance Consultant", text: "I used to freeze when prospects said 'too expensive'. Now I have the perfect response every single time.", score: "61 → 79" },
  { name: "Jake R.", role: "Insurance Broker", text: "My close rate went from 28% to 41% in 6 weeks. This is the unfair advantage I've been looking for.", score: "55 → 88" },
];

export default function LandingPage() {
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [visible, setVisible]           = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWhisperIndex(i => (i + 1) % WHISPERS.length);
        setVisible(true);
      }, 400);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const w = WHISPERS[whisperIndex];

  return (
    <div style={{ minHeight: "100vh", background: "#080b12", color: "#e2e8f0", overflowX: "hidden" }}>

      {/* ── Ambient bg ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-400px", left: "50%", transform: "translateX(-50%)", width: "900px", height: "900px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,163,0.05) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,255,163,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,163,0.012) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
      </div>

      {/* ── Nav ── */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg,#00ffa3,#00c27a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#080b12", fontSize: "18px", boxShadow: "0 0 20px rgba(0,255,163,0.3)" }}>P</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: "800", color: "#fff" }}>PitchSense</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/sign-in" style={{ padding: "8px 18px", borderRadius: "8px", color: "#64748b", fontSize: "13px", textDecoration: "none", fontFamily: "inherit" }}>Sign In</Link>
          <Link href="/sign-up" style={{ padding: "9px 20px", borderRadius: "8px", background: "linear-gradient(135deg,#00ffa3,#00c27a)", color: "#080b12", fontSize: "13px", fontWeight: "700", textDecoration: "none", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(0,255,163,0.25)" }}>Start Free →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "100px 24px 80px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "20px", background: "rgba(0,255,163,0.06)", border: "1px solid rgba(0,255,163,0.15)", marginBottom: "32px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ffa3", animation: "blink 1.5s infinite" }} />
          <span style={{ fontSize: "11px", color: "#00ffa3", letterSpacing: "1.5px", fontWeight: "600" }}>POWERED BY CLAUDE AI</span>
        </div>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(42px, 7vw, 80px)", fontWeight: "800", lineHeight: 1.05, color: "#fff", marginBottom: "24px", letterSpacing: "-2px" }}>
          Your AI co-pilot<br />
          <span style={{ background: "linear-gradient(135deg,#00ffa3,#00c27a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            for every sales call
          </span>
        </h1>

        <p style={{ fontSize: "18px", color: "#64748b", maxWidth: "540px", margin: "0 auto 48px", lineHeight: 1.7 }}>
          Real-time whispers in your ear. Exact words to say. Close more deals — starting today.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/sign-up" style={{ padding: "16px 36px", borderRadius: "12px", background: "linear-gradient(135deg,#00ffa3,#00c27a)", color: "#080b12", fontSize: "15px", fontWeight: "800", textDecoration: "none", fontFamily: "inherit", boxShadow: "0 8px 32px rgba(0,255,163,0.3)", letterSpacing: "0.5px" }}>
            Start Free Trial →
          </Link>
          <Link href="#features" style={{ padding: "16px 32px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "15px", textDecoration: "none", fontFamily: "inherit" }}>
            See How It Works
          </Link>
        </div>

        <div style={{ fontSize: "12px", color: "#334155", marginTop: "16px" }}>No credit card required • 14-day free trial • Cancel anytime</div>

        {/* Live whisper demo */}
        <div style={{ maxWidth: "520px", margin: "64px auto 0", padding: "20px 24px", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "left", transition: "all 0.4s ease", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ fontSize: "18px" }}>🎧</span>
            <span style={{ fontSize: "10px", fontWeight: "800", letterSpacing: "2px", color: "#00ffa3" }}>{w.signal}</span>
            <span style={{ marginLeft: "auto", fontSize: "10px", color: "#334155" }}>LIVE WHISPER</span>
          </div>
          <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6", padding: "10px 14px", background: "rgba(0,255,163,0.04)", borderRadius: "8px", borderLeft: "3px solid #00ffa3" }}>
            {w.text}
          </div>
        </div>
      </section>

      {/* ── Social proof numbers ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "40px 48px", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "24px", textAlign: "center" }}>
          {[
            { val: "41%",  label: "Avg close rate lift" },
            { val: "2.3x", label: "More deals closed" },
            { val: "8s",   label: "Avg whisper speed" },
            { val: "94%",  label: "User satisfaction" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "36px", fontWeight: "800", color: "#00ffa3", lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: "11px", color: "#334155", marginTop: "6px", letterSpacing: "0.5px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ position: "relative", zIndex: 1, padding: "100px 48px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ fontSize: "11px", color: "#00ffa3", letterSpacing: "2px", marginBottom: "16px" }}>FEATURES</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: "800", color: "#fff", letterSpacing: "-1px" }}>Everything you need<br />to close more deals</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ padding: "24px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,255,163,0.15)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{f.icon}</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>{f.title}</div>
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.7" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 48px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{ fontSize: "11px", color: "#00ffa3", letterSpacing: "2px", marginBottom: "16px" }}>TESTIMONIALS</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: "800", color: "#fff", letterSpacing: "-1px" }}>Salespeople love it</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ padding: "24px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.7", marginBottom: "20px" }}>"{t.text}"</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{t.name}</div>
                    <div style={{ fontSize: "11px", color: "#334155", marginTop: "2px" }}>{t.role}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "10px", color: "#334155", marginBottom: "2px" }}>SCORE</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#00ffa3" }}>{t.score}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "100px 48px" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ fontSize: "11px", color: "#00ffa3", letterSpacing: "2px", marginBottom: "16px" }}>PRICING</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: "800", color: "#fff", letterSpacing: "-1px" }}>Simple pricing</h2>
            <p style={{ color: "#475569", fontSize: "14px", marginTop: "12px" }}>14-day free trial on all plans. No credit card required.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {PRICING.map((p, i) => (
              <div key={i} style={{
                padding: "32px", borderRadius: "16px",
                background: p.highlight ? "rgba(0,255,163,0.05)" : "rgba(255,255,255,0.02)",
                border: p.highlight ? "1px solid rgba(0,255,163,0.25)" : "1px solid rgba(255,255,255,0.06)",
                position: "relative", overflow: "hidden",
              }}>
                {p.highlight && (
                  <div style={{ position: "absolute", top: "16px", right: "16px", padding: "3px 10px", borderRadius: "20px", background: "rgba(0,255,163,0.15)", color: "#00ffa3", fontSize: "10px", fontWeight: "700", letterSpacing: "1px" }}>POPULAR</div>
                )}
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#94a3b8", marginBottom: "12px", letterSpacing: "1px" }}>{p.name.toUpperCase()}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "24px" }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontSize: "48px", fontWeight: "800", color: "#fff", lineHeight: 1 }}>{p.price}</span>
                  <span style={{ color: "#475569", fontSize: "14px" }}>{p.period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ color: "#00ffa3", fontSize: "14px" }}>✓</span>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/sign-up" style={{
                  display: "block", textAlign: "center", padding: "13px",
                  borderRadius: "10px", textDecoration: "none", fontFamily: "inherit",
                  fontSize: "13px", fontWeight: "700", letterSpacing: "0.5px",
                  background: p.highlight ? "linear-gradient(135deg,#00ffa3,#00c27a)" : "rgba(255,255,255,0.06)",
                  color: p.highlight ? "#080b12" : "#94a3b8",
                  border: p.highlight ? "none" : "1px solid rgba(255,255,255,0.08)",
                }}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 48px 120px", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(36px,6vw,64px)", fontWeight: "800", color: "#fff", letterSpacing: "-2px", marginBottom: "20px", lineHeight: 1.05 }}>
            Ready to close<br />
            <span style={{ background: "linear-gradient(135deg,#00ffa3,#00c27a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>more deals?</span>
          </h2>
          <p style={{ fontSize: "16px", color: "#475569", marginBottom: "40px" }}>Join salespeople already using PitchSense to win more calls.</p>
          <Link href="/sign-up" style={{ padding: "18px 48px", borderRadius: "12px", background: "linear-gradient(135deg,#00ffa3,#00c27a)", color: "#080b12", fontSize: "16px", fontWeight: "800", textDecoration: "none", fontFamily: "inherit", boxShadow: "0 8px 40px rgba(0,255,163,0.35)", letterSpacing: "0.5px", animation: "glow 3s infinite" }}>
            Start Free Trial →
          </Link>
          <div style={{ fontSize: "12px", color: "#334155", marginTop: "16px" }}>No credit card • 14-day free trial • Cancel anytime</div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: "relative", zIndex: 1, padding: "24px 48px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "linear-gradient(135deg,#00ffa3,#00c27a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#080b12", fontSize: "12px" }}>P</div>
          <span style={{ fontSize: "13px", color: "#334155" }}>PitchSense</span>
        </div>
        <div style={{ fontSize: "11px", color: "#1e293b" }}>© 2026 PitchSense • Powered by Claude</div>
      </footer>
    </div>
  );
}
