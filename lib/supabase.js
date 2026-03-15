import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Call History helpers ──────────────────────────────────────────────────────

export async function saveCall({ userId, prospectName, transcript, signals, scoreData, duration }) {
  const { data, error } = await supabase
    .from("calls")
    .insert([{
      user_id:       userId,
      prospect_name: prospectName || "Unknown",
      transcript:    transcript,
      signals:       signals,
      score:         scoreData?.score || 0,
      grade:         scoreData?.grade || "N/A",
      duration:      duration,
      top_moment:    scoreData?.top_moment || "",
      biggest_miss:  scoreData?.biggest_miss || "",
      improvement:   scoreData?.improvement_tip || "",
      strengths:     scoreData?.strengths || [],
      buying_signals: signals?.filter(s => s.type === "buying").length || 0,
      objections:    signals?.filter(s => s.type === "objection").length || 0,
      created_at:    new Date().toISOString(),
    }])
    .select();

  if (error) console.error("Supabase save error:", error);
  return data;
}

export async function getCalls(userId) {
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) console.error("Supabase fetch error:", error);
  return data || [];
}

export async function getCallById(callId) {
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .eq("id", callId)
    .single();

  if (error) console.error("Supabase fetch error:", error);
  return data;
}
