import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const offset = (page - 1) * limit;

  // Utilize RLS: The database natively filters the results securely.
  const { data, error, count } = await supabase
    .from("resumes")
    .select("id, title, updated_at, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ resumes: data, total: count });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { id, title, data } = payload;

    // Only allow Upsert if it strictly matches user. RLS acts as a second wall.
    const { data: result, error } = await supabase
      .from("resumes")
      .upsert({ 
        ...(id ? { id } : {}), // Omit ID entirely for new inserts ensuring default UUID fires
        user_id: user.id, 
        title: title || "Untitled Resume", 
        data 
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }
}
