import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import path from 'path';

// Load keys
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function testSheet() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    
    // Some env parsers don't parse newlines from strings automatically
    if (privateKey && privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      console.log('Missing credentials in .env.local!');
      return;
    }

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
      ['#DS0001', 'API TEST', 'Testing API', 'Student', 'Beginner', 'Internet', 'https://test.com', 'Testing connection from local debug script', new Date().toLocaleString()]
    ];

    console.log('Attempting to append to sheet:', sheetId);
    
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.log('✅ HUGE SUCCESS: Data pushed to Google sheets. Status:', res.status);
  } catch (err: any) {
    console.error('❌ Google Sheets API FAILED:');
    console.error(err.message);
    if (err.response && err.response.data) {
        console.error('API Error Details:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

testSheet();
