import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;

  try {
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await completion.json();
    const response = data.choices?.[0]?.message?.content || 'No response';

    // Save to Supabase
    await supabase.from('prompts').insert([{ prompt, response }]);

    res.status(200).json({ result: response });
  } catch (error) {
    console.error('Error in API handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
