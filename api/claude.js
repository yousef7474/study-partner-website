module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version,
  Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const apiKey = process.env.CLAUDE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Claude API key not configured' });
      }

      console.log('🤖 Calling Claude API...');

      // Use dynamic import for fetch if needed, or use built-in fetch in Node 18+
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1500,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error:', response.status, errorText);
        return res.status(response.status).json({
          error: 'Claude API failed',
          details: errorText
        });
      }

      const data = await response.json();
      console.log('✅ Claude API success');

      return res.status(200).json(data);

    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  };
