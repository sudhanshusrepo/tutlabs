import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const salt = process.env.IP_SALT || 'temp_salt_for_local_development_fallback';

  let insertPayload: any = {
    download_count: 1,
    date: new Date().toISOString().split('T')[0]
  };

  if (user) {
    insertPayload.user_id = user.id;
  } else {
    // Generate secure hashed identifier from HTTP properties
    const fallbackIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const exactIp = fallbackIp.split(',')[0].trim();
    const hash = crypto.createHmac('sha256', salt).update(exactIp).digest('hex');
    insertPayload.ip_hash = hash;
  }

  // Rate Limiting Intercept: Verify limits prior to logging new entries
  const today = new Date().toISOString().split('T')[0];
  const queryField = user ? 'user_id' : 'ip_hash';
  const keyIdentifier = user ? user.id : insertPayload.ip_hash;

  const { data: currentLogs } = await supabase
    .from('download_logs')
    .select('download_count')
    .eq(queryField, keyIdentifier)
    .eq('date', today);

  const totalCount = currentLogs ? currentLogs.reduce((acc, row) => acc + row.download_count, 0) : 0;
  
  if (totalCount >= 3) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { 
      status: 429,
      headers: { 'Retry-After': '86400' } // Suggest a generic 24 hour retry constraint for standard adherence
    });
  }

  // Attempt to submit hit footprint
  const { error } = await supabase
    .from('download_logs')
    .insert([insertPayload]);

  if (error) {
    console.error("Increment Fail:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
