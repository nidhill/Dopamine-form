import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Registration } from '@/lib/supabase';

// Use service role key to bypass RLS completely
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

async function appendToGoogleSheet(data: Registration & { unique_id: string }) {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey) {
      privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    }
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      console.log('Google Sheets credentials not configured, skipping');
      return;
    }

    const { google } = await import('googleapis');

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const values = [[
      data.unique_id,
      data.full_name,
      data.what_you_do.join(', '),
      data.current_role,
      data.experience_level,
      data.location,
      data.portfolio_link || '',
      data.haca_connection,
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.log('✅ Google Sheets updated');
  } catch (err) {
    console.error('❌ Google Sheets error:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body: Registration = await request.json();

    const uniqueId = `#DS${String(Date.now()).slice(-6)}`;

    const payload = { ...body, unique_id: uniqueId };

    console.log('📝 Inserting:', uniqueId, body.full_name);

    const { data, error } = await supabase
      .from('registrations')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', JSON.stringify(error));
      throw new Error(error.message);
    }

    console.log('✅ Saved to Supabase:', uniqueId);

    appendToGoogleSheet(payload).catch(console.error);

    return NextResponse.json({ success: true, data, unique_id: uniqueId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Registration failed:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
