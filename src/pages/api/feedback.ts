import type { APIRoute } from 'astro';
import { google } from 'googleapis';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text, type, email } = await request.json();
    
    if (!text || !type) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { 
        status: 400 
      });
    }

    // Initialize Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
  client_email: import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: import.meta.env.GOOGLE_PRIVATE_KEY?.split('\\n').join('\n'),
},
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Append row to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: import.meta.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:D',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          new Date().toISOString(),
          type,
          text,
          email || ''
        ]]
      }
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Sheets error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save' }), { 
      status: 500 
    });
  }
};