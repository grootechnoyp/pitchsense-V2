"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import "../globals.css";

// ─── Claude AI Helper ─────────────────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage, maxTokens = 400) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.content?.[0]?.text || "";
}

// ─── Static data ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "live",     icon: "◉", label: "Live Call"  },
  { id: "playbook", icon: "◈", label: "Playbook"   },
  { id: "history",  icon: "◷", label: "History"    },
  { id: "score",    icon: "◎", label: "Score"      },
];

const INITIAL_PLAYBOOK = [
  { id: 1, tag: "Price",    title: "ROI Bridge",        rate: 74, uses: 14, script: "When they say 'expensive', pivot: 'Our avg customer saves $4,200/mo. At $299, that's a 14x return in month one. Does that math work for you?'" },
  { id: 2, tag: "Stall",    title: "The 1–10 Close",    rate: 68, uses: 11, script: "Ask: 'On a scale of 1–10, how close are we to moving forward?' — anything under 8 surfaces the real hidden objection." },
  { id: 3, tag: "Authority",title: "Manager Proxy",     rate: 61, uses: 8,  script: "'If your manager were on this call right now, what would be her top question?' Maps the full decision tree." },
  { id: 4, tag: "Buying",   title: "Future Pace Close", rate: 81, uses: 17, script: "When they say 'we could' or 'what if' — they're imagining ownership. Ask: 'Should we map out an implementation timeline?'" },
];

const TAG_COLORS = {
  Price: "#f97316", Stall: "#eab308", Authority: "#8b5cf6",
  Buying: "#22c55e", Objection: "#ef4444", Discovery: "#3b82f6",
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function Waveform({ active }) {
  const [heights, setHeights] = useState(Array(24).fill(4));
  useEffect(() => {
    if (!active) { setHeights(Array(24).fill(4)); return; }
    const id = setInterval(() => setHeights(Array(24).fill(0).map(() => Math.random() * 22 + 4)), 140);
    return () => clearInterval(id);
  }, [active]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "28px" }}>
      {heights.map((h, i) => (
        <div key={i} style={{ width: "3px", borderRadius: "2px", transition: "height 0.12s ease", background: active ? "#00ffa3" : "rgba(255,255,255,0.07)", height: `${h}px` }} />
      ))}
    </div>
  );
}

function ScoreRing({ score, size = 140 }) {
  const r = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  const color = score >= 75 ? "#00ffa3" : score >= 55 ? "#facc15" : "#f87171";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${(score/100)*circ} ${circ}`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,2,.6,1)" }}
      />
    </svg>
  );
}

function LoadingDots({ color = "#00ffa3" }) {
  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
      {[0,1,2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, animation: `dot 0.7s ${i*0.15}s infinite alternate` }} />)}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useUser();
  const [tab, setTab]           = useState("live");
  const [isLive, setIsLive]     = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [ended, setEnded]       = useState(false);
  const [prospectName, setProspectName] = useState("");

  const [transcript, setTranscript]     = useState([]);
  const [prospectInput, setProspectInput] = useState("");
  const transcriptRef = useRef(null);

  const [whisper, setWhisper]             = useState(null);
  const [whisperLoading, setWhisperLoading] = useState(false);
  const [signals, setSignals]             = useState([]);

  const [scoreData, setScoreData]         = useState(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  const [playbook, setPlaybook]           = useState(INITIAL_PLAYBOOK);
  const [playbookLoading, setPlaybookLoading] = useState(false);

  const [callHistory, setCallHistory]     = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [error, setError]   = useState("");
  const timerRef            = useRef(null);
  const debounceRef         = useRef(null);
  const whisperTimerRef     = useRef(null);

  // ── Fetch history on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res  = await fetch("/api/calls");
      const data = await res.json();
      if (data.calls) setCallHistory(data.calls);
    } catch (e) { console.error(e); }
    setHistoryLoading(false);
  };

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLive) timerRef.current = setInterval(() => setCallTime(t => t + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [isLive]);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [transcript]);

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  // ── Handle prospect input ─────────────────────────────────────────────────
  const handleProspectInput = useCallback((val) => {
    setProspectInput(val);
    if (!val.trim() || !isLive) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setTranscript(prev => [...prev, { speaker: "Prospect", text: val, time: fmt(callTime) }]);
      setProspectInput("");
      setWhisperLoading(true);
      setError("");
      try {
        const system = `You are PitchSense, an AI sales coach whispering in a salesperson's ear during a LIVE call.
Analyze what the PROSPECT just said. Respond with ONLY valid JSON (no markdown):
{
  "signal": "emoji + short label e.g. '💰 Price Objection'",
  "type": "objection" or "buying" or "neutral",
  "whisper": "One punchy coaching note under 20 words",
  "counter": "Exact words to say RIGHT NOW. Under 30 words."
}`;
        const raw    = await callClaude(system, `Prospect said: "${val}"\nContext: Selling PitchSense ($299/mo AI sales tool) to a solo salesperson.`, 300);
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        const sig    = { ...parsed, id: Date.now() };
        setWhisper(sig);
        setSignals(prev => [sig, ...prev].slice(0, 15));
        clearTimeout(whisperTimerRef.current);
        whisperTimerRef.current = setTimeout(() => setWhisper(null), 9000);
      } catch (e) { setError("AI error — try again."); }
      setWhisperLoading(false);
    }, 700);
  }, [isLive, callTime]);

  const handleRepLine = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      setTranscript(prev => [...prev, { speaker: "You", text: e.target.value.trim(), time: fmt(callTime) }]);
      e.target.value = "";
    }
  };

  // ── End call ──────────────────────────────────────────────────────────────
  const endCall = async () => {
    setIsLive(false); setEnded(true); setTab("score"); setScoringLoading(true); setError("");
    try {
      const lines = transcript.map(l => `${l.speaker}: ${l.text}`).join("\n");
      const buys  = signals.filter(s => s.type === "buying").length;
      const objs  = signals.filter(s => s.type === "objection").length;

      const system = `You are a sales performance analyst. Analyze this call and return ONLY valid JSON (no markdown):
{
  "score": number 0-100,
  "grade": "A"|"B"|"C"|"D",
  "talk_ratio": "XX% You / XX% Prospect",
  "top_moment": "One sentence",
  "biggest_miss": "One sentence",
  "improvement_tip": "One actionable tip under 20 words",
  "strengths": ["strength 1","strength 2","strength 3"],
  "new_play": { "tag": "Price|Stall|Authority|Buying|Objection|Discovery", "title": "title", "script": "tactic 1-2 sentences" }
}`;
      const raw    = await callClaude(system, `Transcript:\n${lines || "(minimal)"}\n\nStats: ${buys} buying, ${objs} objections. Duration: ${fmt(callTime)}.`, 700);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      const sd     = { ...parsed, duration: fmt(callTime), buying: buys, objections: objs };
      setScoreData(sd);

      // Auto-add new play
      if (parsed.new_play) {
        setPlaybook(prev => [{ id: Date.now(), ...parsed.new_play, rate: parsed.score, uses: 1 }, ...prev].slice(0, 10));
      }

      // Save to Supabase
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectName, transcript, signals,
          scoreData: sd, duration: fmt(callTime),
        }),
      });
      fetchHistory();

    } catch (e) {
      setScoreData({ score: 68, grade: "B", talk_ratio: "44% / 56%", top_moment: "Good rapport building.", biggest_miss: "More discovery questions needed.", improvement_tip: "Ask 'What does success look like?' in the first 3 minutes.", strengths: ["Active listening","Handled objections calmly","Good pacing"], duration: fmt(callTime), buying: signals.filter(s=>s.type==="buying").length, objections: signals.filter(s=>s.type==="objection").length });
    }
    setScoringLoading(false);
  };

  const generatePlays = async () => {
    setPlaybookLoading(true);
    try {
      const system = `Generate 3 fresh sales plays as a JSON array ONLY (no markdown):
[{ "tag":"Price|Stall|Authority|Buying|Objection|Discovery","title":"catchy title","rate":55-85,"uses":5-20,"script":"tactic under 40 words" }]`;
      const raw    = await callClaude(system, "Generate 3 new winning sales plays for a solo SaaS salesperson.", 500);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setPlaybook(prev => [...parsed.map((p,i) => ({ ...p, id: Date.now()+i })), ...prev].slice(0, 10));
    } catch (e) { setError("Could not generate plays."); }
    setPlaybookLoading(false);
  };

  const reset = () => {
    setIsLive(false); setEnded(false); setCallTime(0);
    setTranscript([]); setSignals([]); setWhisper(null);
    setScoreData(null); setProspectInput(""); setProspectName("");
    setError(""); setTab("live");
  };

  // ── Avg stats from real history ───────────────────────────────────────────
  const avgScore    = callHistory.length ? Math.round(callHistory.reduce((a,c) => a + c.score, 0) / callHistory.length) : 0;
  const totalCalls  = callHistory.length;
  const avgBuying   = callHistory.length ? Math.round(callHistory.reduce((a,c) => a + (c.buying_signals||0), 0) / callHistory.length) : 0;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#080b12", color: "#e2e8f0", fontFamily: "'IBM Plex Mono',monospace" }}>

      {/* Ambient bg */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-300px", left: "-200px", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,255,163,0.04) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-200px", right: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.05) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,255,163,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,163,0.015) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "980px", margin: "0 auto", padding: "20px 16px" }}>

        {/* ── Header ── */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg,#00ffa3,#00c27a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "900", color: "#080b12", boxShadow: "0 0 24px rgba(0,255,163,0.25)" }}>P</div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", lineHeight: 1 }}>PitchSense</div>
              <div style={{ fontSize: "10px", color: "#334155", letterSpacing: "2px", marginTop: "3px" }}>AI SALES CO-PILOT</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isLive && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ef4444", animation: "blink 1s infinite" }} />
                <span style={{ color: "#f87171", fontSize: "12px", fontWeight: "700" }}>LIVE • {fmt(callTime)}</span>
              </div>
            )}
            <div style={{ fontSize: "12px", color: "#475569" }}>
              {user?.firstName ? `Hey, ${user.firstName} 👋` : ""}
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* ── Error ── */}
        {error && (
          <div style={{ marginBottom: "16px", padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
            ⚠ {error}
            <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#f87171", fontSize: "16px" }}>×</button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: "2px", marginBottom: "24px", padding: "4px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", width: "fit-content" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "9px 20px", borderRadius: "9px", border: "none", fontFamily: "inherit",
              fontSize: "12px", fontWeight: "600", letterSpacing: "0.5px", transition: "all 0.18s",
              background: tab === t.id ? "rgba(0,255,163,0.1)" : "transparent",
              color: tab === t.id ? "#00ffa3" : "#475569",
              boxShadow: tab === t.id ? "inset 0 0 0 1px rgba(0,255,163,0.2)" : "none",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {/* ════ LIVE CALL ════ */}
        {tab === "live" && (
          <div>
            {!isLive && !ended && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", color: "#475569", letterSpacing: "1px", marginBottom: "8px" }}>WHO ARE YOU CALLING?</div>
                <input value={prospectName} onChange={e => setProspectName(e.target.value)} placeholder="e.g. Sarah at Acme Corp"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "11px 16px", color: "#e2e8f0", fontFamily: "inherit", fontSize: "14px", outline: "none", width: "320px" }} />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Whisper banner */}
                <div style={{
                  minHeight: "100px", borderRadius: "14px", padding: "16px 20px", transition: "all 0.35s ease",
                  background: whisper ? whisper.type==="buying" ? "linear-gradient(135deg,rgba(0,255,163,0.08),rgba(0,194,122,0.04))" : whisper.type==="objection" ? "linear-gradient(135deg,rgba(239,68,68,0.08),rgba(220,38,38,0.04))" : "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
                  border: whisper ? whisper.type==="buying" ? "1px solid rgba(0,255,163,0.25)" : whisper.type==="objection" ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.04)",
                }}>
                  {whisperLoading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", height: "68px" }}><LoadingDots /><span style={{ fontSize: "12px", color: "#475569" }}>Claude is analyzing...</span></div>
                  ) : whisper ? (
                    <div style={{ animation: "fadeIn 0.3s ease" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "18px" }}>🎧</span>
                        <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "1.5px", color: whisper.type==="buying" ? "#00ffa3" : "#f87171" }}>{whisper.signal}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>{whisper.whisper}</div>
                      <div style={{ fontSize: "13px", color: "#e2e8f0", lineHeight: "1.6", padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", borderLeft: `3px solid ${whisper.type==="buying"?"#00ffa3":"#f87171"}` }}>
                        💬 "{whisper.counter}"
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "68px", opacity: 0.2 }}>
                      <span style={{ fontSize: "24px" }}>🎧</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{isLive ? "Type what the prospect says — AI whispers appear here" : "Start a call to activate AI coaching"}</span>
                    </div>
                  )}
                </div>

                {/* Transcript */}
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", color: "#334155", letterSpacing: "1.5px" }}>LIVE TRANSCRIPT</span>
                    <Waveform active={isLive} />
                  </div>
                  <div ref={transcriptRef} style={{ height: "230px", overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {transcript.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#1e293b", fontSize: "12px", paddingTop: "80px" }}>{isLive ? "Type below to start ↓" : "Start a call to begin"}</div>
                    ) : transcript.map((l, i) => (
                      <div key={i} style={{ display: "flex", gap: "12px", animation: "fadeIn 0.2s ease" }}>
                        <span style={{ fontSize: "10px", color: "#334155", minWidth: "34px", paddingTop: "2px", flexShrink: 0 }}>{l.time}</span>
                        <div>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: l.speaker==="You"?"#00ffa3":"#818cf8" }}>{l.speaker.toUpperCase()} </span>
                          <span style={{ fontSize: "13px", color: l.speaker==="You"?"#cbd5e1":"#94a3b8" }}>{l.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {isLive && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <input value={prospectInput} onChange={e => handleProspectInput(e.target.value)} placeholder="📝 Prospect says → (triggers AI whisper)"
                        style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "inherit", fontSize: "12px", color: "#818cf8", padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)", boxSizing: "border-box" }} />
                      <input onKeyDown={handleRepLine} placeholder="🎤 You say → (press Enter to log)"
                        style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "inherit", fontSize: "12px", color: "#00ffa3", padding: "11px 16px", boxSizing: "border-box" }} />
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div style={{ display: "flex", gap: "10px" }}>
                  {!isLive && !ended && <button onClick={() => { setIsLive(true); setError(""); }} style={{ flex: 1, padding: "15px", borderRadius: "12px", border: "none", fontFamily: "inherit", fontSize: "14px", fontWeight: "800", letterSpacing: "1px", background: "linear-gradient(135deg,#00ffa3,#00c27a)", color: "#080b12", boxShadow: "0 4px 24px rgba(0,255,163,0.2)" }}>▶ START CALL</button>}
                  {isLive && <button onClick={endCall} style={{ flex: 1, padding: "15px", borderRadius: "12px", fontFamily: "inherit", fontSize: "14px", fontWeight: "700", background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>■ END CALL + SCORE</button>}
                  {ended && <button onClick={reset} style={{ flex: 1, padding: "15px", borderRadius: "12px", fontFamily: "inherit", fontSize: "14px", fontWeight: "700", background: "rgba(255,255,255,0.03)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>↩ NEW CALL</button>}
                </div>
              </div>

              {/* Signal feed */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[{ label:"Buying", val:signals.filter(s=>s.type==="buying").length, color:"#00ffa3" }, { label:"Objections", val:signals.filter(s=>s.type==="objection").length, color:"#f87171" }].map(s => (
                    <div key={s.label} style={{ padding: "14px", borderRadius: "10px", textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: "30px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: "10px", color: "#334155", marginTop: "4px", letterSpacing: "1px" }}>{s.label.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", flex: 1 }}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: "10px", color: "#334155", letterSpacing: "1.5px" }}>SIGNAL LOG</span>
                  </div>
                  <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "6px", maxHeight: "340px", overflowY: "auto" }}>
                    {signals.length === 0 ? <div style={{ fontSize: "11px", color: "#1e293b", textAlign: "center", padding: "50px 8px" }}>Signals appear here live</div>
                    : signals.map((s, i) => (
                      <div key={s.id} style={{ padding: "9px 11px", borderRadius: "8px", opacity: Math.max(0.25, 1-i*0.08), background: s.type==="buying"?"rgba(0,255,163,0.04)":s.type==="objection"?"rgba(239,68,68,0.04)":"rgba(255,255,255,0.02)", border: s.type==="buying"?"1px solid rgba(0,255,163,0.1)":s.type==="objection"?"1px solid rgba(239,68,68,0.1)":"1px solid rgba(255,255,255,0.04)", animation: "fadeIn 0.25s ease" }}>
                        <div style={{ fontSize: "10px", fontWeight: "700", color: s.type==="buying"?"#00ffa3":s.type==="objection"?"#f87171":"#94a3b8", marginBottom: "3px" }}>{s.signal}</div>
                        <div style={{ fontSize: "10px", color: "#475569", lineHeight: "1.4" }}>{s.whisper}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ PLAYBOOK ════ */}
        {tab === "playbook" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>Your Playbook</div>
                <div style={{ fontSize: "12px", color: "#334155", marginTop: "4px" }}>{playbook.length} plays • Auto-updated from your calls</div>
              </div>
              <button onClick={generatePlays} disabled={playbookLoading} style={{ padding: "9px 18px", borderRadius: "9px", background: "rgba(0,255,163,0.08)", border: "1px solid rgba(0,255,163,0.2)", color: playbookLoading?"#334155":"#00ffa3", fontFamily: "inherit", fontSize: "12px", fontWeight: "600" }}>
                {playbookLoading ? <span style={{ display:"flex",alignItems:"center",gap:"8px" }}><LoadingDots /> Generating...</span> : "✦ AI Generate Plays"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {playbook.map(play => (
                <div key={play.id} style={{ padding: "18px 20px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", transition: "border-color 0.2s,transform 0.2s", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.05)"; e.currentTarget.style.transform="none"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>{play.title}</div>
                    <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "20px", background: `${TAG_COLORS[play.tag]||"#64748b"}18`, color: TAG_COLORS[play.tag]||"#64748b", border: `1px solid ${TAG_COLORS[play.tag]||"#64748b"}30`, flexShrink: 0, marginLeft: "8px" }}>{play.tag}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.6", marginBottom: "12px" }}>{play.script}</div>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <span style={{ fontSize: "11px", color: "#334155" }}>📈 {play.rate}% close rate</span>
                    <span style={{ fontSize: "11px", color: "#334155" }}>🔁 {play.uses} uses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ HISTORY ════ */}
        {tab === "history" && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>Call History</div>
              <div style={{ fontSize: "12px", color: "#334155", marginTop: "4px" }}>Saved to your account • Powered by Supabase</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: "Avg Score",   val: avgScore || "—",  color: "#00ffa3" },
                { label: "Total Calls", val: totalCalls,        color: "#818cf8" },
                { label: "Avg Signals", val: avgBuying,         color: "#facc15" },
                { label: "This Month",  val: callHistory.filter(c => new Date(c.created_at) > new Date(Date.now()-30*24*60*60*1000)).length, color: "#f97316" },
              ].map(s => (
                <div key={s.label} style={{ padding: "16px", borderRadius: "12px", textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: "10px", color: "#334155", marginTop: "5px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {historyLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}><LoadingDots /></div>
            ) : callHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#334155", fontSize: "13px" }}>
                No calls yet — complete your first call to see history here
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {callHistory.map(call => (
                  <div key={call.id} style={{ padding: "16px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.05)"}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0" }}>{call.prospect_name}</div>
                      <div style={{ fontSize: "11px", color: "#334155", marginTop: "3px" }}>{new Date(call.created_at).toLocaleDateString()} • {call.duration}</div>
                    </div>
                    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "18px", fontWeight: "700", color: "#00ffa3" }}>{call.buying_signals}</div>
                        <div style={{ fontSize: "10px", color: "#334155" }}>SIGNALS</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "18px", fontWeight: "700", color: "#f87171" }}>{call.objections}</div>
                        <div style={{ fontSize: "10px", color: "#334155" }}>OBJECTIONS</div>
                      </div>
                      <div style={{ position: "relative", width: "56px", height: "56px" }}>
                        <ScoreRing score={call.score} size={56} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: call.score>=75?"#00ffa3":"#facc15" }}>{call.score}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ SCORE ════ */}
        {tab === "score" && (
          <div>
            {scoringLoading ? (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}><LoadingDots /></div>
                <div style={{ fontSize: "14px", color: "#475569" }}>Claude is scoring your call...</div>
              </div>
            ) : !scoreData ? (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <div style={{ fontSize: "52px", marginBottom: "16px" }}>📊</div>
                <div style={{ fontSize: "16px", color: "#334155" }}>No call scored yet</div>
                <button onClick={() => setTab("live")} style={{ marginTop: "16px", padding: "11px 28px", borderRadius: "10px", background: "rgba(0,255,163,0.08)", border: "1px solid rgba(0,255,163,0.2)", color: "#00ffa3", fontFamily: "inherit", fontSize: "13px" }}>Start a Call →</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "32px", marginBottom: "16px", padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ position: "relative", width: "140px", height: "140px", flexShrink: 0 }}>
                    <ScoreRing score={scoreData.score} size={140} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: "44px", fontWeight: "900", color: scoreData.score>=75?"#00ffa3":scoreData.score>=55?"#facc15":"#f87171", lineHeight: 1 }}>{scoreData.score}</div>
                      <div style={{ fontSize: "13px", color: "#475569" }}>{scoreData.grade}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {prospectName && <div style={{ fontSize: "11px", color: "#334155", letterSpacing: "1.5px", marginBottom: "6px" }}>CALL WITH {prospectName.toUpperCase()}</div>}
                    <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: scoreData.score>=80?"#00ffa3":scoreData.score>=65?"#facc15":"#f87171" }}>
                      {scoreData.score>=80?"🔥 Excellent Call":scoreData.score>=65?"✅ Solid Performance":"📈 Room to Grow"}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
                      {[{l:"Duration",v:scoreData.duration},{l:"Talk Ratio",v:scoreData.talk_ratio},{l:"Buying Signals",v:scoreData.buying},{l:"Objections",v:scoreData.objections}].map(s => (
                        <div key={s.l}>
                          <div style={{ fontSize: "10px", color: "#334155" }}>{s.l}</div>
                          <div style={{ fontSize: "16px", fontWeight: "700", color: "#e2e8f0", marginTop: "3px" }}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(0,255,163,0.04)", border: "1px solid rgba(0,255,163,0.12)" }}>
                    <div style={{ fontSize: "10px", color: "#00ffa3", letterSpacing: "1.5px", marginBottom: "8px" }}>⭐ TOP MOMENT</div>
                    <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5" }}>{scoreData.top_moment}</div>
                  </div>
                  <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
                    <div style={{ fontSize: "10px", color: "#f87171", letterSpacing: "1.5px", marginBottom: "8px" }}>⚠ BIGGEST MISS</div>
                    <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5" }}>{scoreData.biggest_miss}</div>
                  </div>
                </div>
                <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(250,204,21,0.04)", border: "1px solid rgba(250,204,21,0.1)", marginBottom: "12px" }}>
                  <div style={{ fontSize: "10px", color: "#facc15", letterSpacing: "1.5px", marginBottom: "8px" }}>🎯 TIP FOR NEXT CALL</div>
                  <div style={{ fontSize: "13px", color: "#cbd5e1" }}>{scoreData.improvement_tip}</div>
                </div>
                {scoreData.strengths?.length > 0 && (
                  <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.1)", marginBottom: "16px" }}>
                    <div style={{ fontSize: "10px", color: "#818cf8", letterSpacing: "1.5px", marginBottom: "10px" }}>💪 YOUR STRENGTHS</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {scoreData.strengths.map((s,i) => <span key={i} style={{ padding: "5px 12px", borderRadius: "20px", background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.15)", fontSize: "12px", color: "#a5b4fc" }}>{s}</span>)}
                    </div>
                  </div>
                )}
                <button onClick={reset} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "inherit", fontSize: "13px", color: "#475569" }}>↩ Start New Call</button>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "40px", textAlign: "center", fontSize: "10px", color: "#1e293b", letterSpacing: "2px" }}>
          PITCHSENSE v2.0 • AI SALES CO-PILOT • POWERED BY CLAUDE
        </div>
      </div>
    </div>
  );
}
