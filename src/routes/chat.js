const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const https = require('https');

const SYSTEM_PROMPT = `You are PRISM AI, a smart real estate assistant for India.
You help with:
- Property prices in cities like Delhi, Mumbai, Bangalore
- Crime risk and safety
- Investment advice
- EMI, stamp duty, registration
- RERA and legal info

Keep answers short (2-4 sentences), clear, and practical. Mention price per sqft when possible.`;

// POST /api/chat
router.post('/', auth, async (req, res) => {
  try {
    const { messages } = req.body;

    // ✅ Validate input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    // ✅ Check API key
    if (!apiKey) {
      return res.json({
        reply: 'Chatbot not configured. Add OPENROUTER_API_KEY in .env'
      });
    }

    // ✅ Prepare request payload
    const payload = JSON.stringify({
      model: "openai/gpt-3.5-turbo", // FREE model
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10)
      ],
      max_tokens: 300
    });

    const options = {
      hostname: "openrouter.ai",
      path: "/api/v1/chat/completions",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = "";

      apiRes.on("data", chunk => {
        data += chunk;
      });

      apiRes.on("end", () => {
        console.log("🔍 OpenRouter Raw Response:", data); // DEBUG

        try {
          const parsed = JSON.parse(data);

          // ✅ Handle API error
          if (parsed.error) {
            return res.json({
              reply: `Error: ${parsed.error.message}`
            });
          }

          // ✅ Extract reply
          const reply =
            parsed.choices &&
            parsed.choices[0] &&
            parsed.choices[0].message &&
            parsed.choices[0].message.content
              ? parsed.choices[0].message.content
              : "No response from AI";

          res.json({ reply });

        } catch (err) {
          console.error("❌ Parse Error:", err);
          res.status(500).json({
            error: 'Failed to parse AI response'
          });
        }
      });
    });

    apiReq.on("error", (err) => {
      console.error("❌ Request Error:", err);
      res.status(500).json({
        error: 'Failed to connect to AI service'
      });
    });

    apiReq.write(payload);
    apiReq.end();

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;