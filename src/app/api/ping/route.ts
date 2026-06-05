import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    await supabase.from('registrations').select('id').limit(1);
    return NextResponse.json({ status: 'ok', time: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
