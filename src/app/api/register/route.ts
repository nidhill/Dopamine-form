import { NextResponse } from 'next/server';
import { supabase, Registration } from '@/lib/supabase';

async function appendToGoogleSheet(data: Registration & { unique_id: string }) {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      console.log('Google Sheets credentials not configured, skipping sheet update');
      return;
    }

    const { google } = await import('googleapis');

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
      [
        data.unique_id,
        data.full_name,
        data.what_you_do.join(', '),
        data.current_role,
        data.experience_level,
        data.location,
        data.portfolio_link || '',
        data.haca_connection,
        new Date().toLocaleString(),
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
  } catch (err) {
    console.error('Google Sheets error:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body: Registration = await request.json();

    // Get the next sequential number
    const { count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    const nextNumber = (count || 0) + 1;
    const uniqueId = `#DS${String(nextNumber).padStart(4, '0')}`;

    const payload = {
      ...body,
      unique_id: uniqueId,
    };

    const { data, error } = await supabase
      .from('registrations')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // Append to Google Sheets (non-blocking)
    appendToGoogleSheet(payload).catch(console.error);

    return NextResponse.json({ success: true, data, unique_id: uniqueId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
