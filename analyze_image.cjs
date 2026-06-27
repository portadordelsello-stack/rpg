const fs = require('fs');

async function run() {
  try {
    const data = fs.readFileSync('public/assets.png');
    const b64 = data.toString('base64');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { data: b64, mimeType: 'image/png' } },
            { text: 'Analyze this sprite sheet. Where are the trees located? Give me the approximate x, y, width, and height in pixels for one or more tree sprites. Just return JSON like {"trees": [{"x":0, "y":0, "w":32, "h":32}]}' }
          ]
        }]
      })
    });
    const json = await response.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
