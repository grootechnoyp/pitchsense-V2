import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function saveCall(data) {
  if (!supabase) return null;
  const { data: result, error } = await supabase.from("calls").insert([{
    user_id:        data.userId,
    prospect_name:  data.prospectName || "Unknown",
    transcript:     data.transcript,
    signals:        data.signals,
    score:          data.scoreData?.score || 0,
    grade:          data.scoreData?.grade || "N/A",
    duration:       data.duration,
    top_moment:     data.scoreData?.top_moment || "",
    biggest_miss:   data.scoreData?.biggest_miss || "",
    improvement:    data.scoreData?.improvement_tip || "",
    strengths:      data.scoreData?.strengths || [],
    buying_signals: data.signals?.filter(s => s.type === "buying").length || 0,
    objections:     data.signals?.filter(s => s.type === "objection").length || 0,
    created_at:     new Date().toISOString(),
  }]).select();
  if (error) console.error("Supabase save error:", error);
  return result;
}

export async function getCalls(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("calls").select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) console.error("Supabase fetch error:", error);
  return data || [];
}
