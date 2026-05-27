const express = require('express');
const router = express.Router();
const twilio = require('twilio');

// 🔐 Twilio client using API Key
const client = twilio(
  process.env.TWILIO_API_KEY,
  process.env.TWILIO_API_SECRET,
  { accountSid: process.env.TWILIO_SID }
);

// 📞 CALL ROUTE
router.post('/', async (req, res) => {
  console.log("📞 CALL API HIT");

  try {
    console.log("🚀 Making call...");

    const call = await client.calls.create({
      to: '+918534095607',              // your verified number
      from: process.env.TWILIO_PHONE,   // your Twilio number
      url: 'https://demo.twilio.com/docs/voice.xml'
    });

    console.log("📞 CALL SID:", call.sid);

    res.json({
      success: true,
      sid: call.sid
    });

  } catch (err) {
    console.error("❌ TWILIO ERROR:", err);
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;