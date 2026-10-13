export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, message, url } = req.body || {};
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const appId = process.env.ONESIGNAL_APP_ID || 'a9bbde99-fe81-4508-88af-089644190fd0';
  const defaultKeyB64 = 'b3NfdjJfYXBwX3ZnNTU1Z3A2cWZjcXJjZnBiY2xlaWdpcDJjaDM2cTJsNG1mZW9zbWNlNm95amJvZnFhcXV1bXdjeGFwN3ZvdnNhenMzcW5uNHFzd3g0cXM3dGk1N2hlMnNrNXV3bXVmaHV4bHVmbnk=';
  const apiKey = process.env.ONESIGNAL_REST_API_KEY || Buffer.from(defaultKeyB64, 'base64').toString('utf-8');

  try {
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`
      },
      body: JSON.stringify({
        app_id: appId,
        headings: { en: title },
        contents: { en: message },
        included_segments: ['Total Subscriptions'],
        url: url || 'https://moneypink.vercel.app'
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('OneSignal Notification Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
