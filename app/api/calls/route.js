import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveCall, getCalls } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const calls = await getCalls(userId);
    return NextResponse.json({ calls });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const data = await saveCall({ userId, ...body });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save call" }, { status: 500 });
  }
}
