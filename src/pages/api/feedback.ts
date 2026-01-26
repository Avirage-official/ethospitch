import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text, type, email } = await request.json();
    
    if (!text || !type) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { 
        status: 400 
      });
    }

    const feedback = {
      text,
      type,
      email: email || null,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    };

    // Read existing feedback
    const filePath = path.join(process.cwd(), 'src', 'data', 'feedback.json');
    let allFeedback: typeof feedback[] = [];
    
    try {
      const existing = await fs.readFile(filePath, 'utf-8');
      allFeedback = JSON.parse(existing);
    } catch {
      // File doesn't exist yet, start fresh
    }

    // Add new feedback
    allFeedback.unshift(feedback);

    // Write back
    await fs.writeFile(filePath, JSON.stringify(allFeedback, null, 2));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save' }), { 
      status: 500 
    });
  }
};