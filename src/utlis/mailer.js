const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const FROM = process.env.MAIL_FROM || 'PRISM System <noreply@prism.ai>';

async function sendMail(to, subject, html) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.log(`[MAIL SKIPPED] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }
  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`[MAIL SENT] To: ${to} | Subject: ${subject}`);
    return info;
  } catch (e) {
    console.error(`[MAIL ERROR]`, e.message);
    return { error: e.message };
  }
}

function baseTemplate(title, body, color = '#2563eb') {
  return `
  <div style="font-family:'Segoe UI',Arial,sans-serif;background:#0a0f1e;padding:40px 20px;min-height:100vh">
    <div style="max-width:560px;margin:0 auto;background:#0f1a2e;border:1px solid #1e2d4a;border-radius:16px;overflow:hidden">
      <div style="background:${color};padding:24px 28px">
        <div style="font-size:13px;font-weight:700;letter-spacing:2px;color:#fff">PROPERTY RISK</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:1.5px">INTELLIGENCE SYSTEM</div>
      </div>
      <div style="padding:28px;color:#e2e8f0">
        <h2 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 16px">${title}</h2>
        ${body}
        <div style="margin-top:28px;padding-top:16px;border-top:1px solid #1e2d4a;font-size:11px;color:#64748b">
          This is an automated email from PRISM — Property Risk Intelligence System.<br>
          Please do not reply to this email.
        </div>
      </div>
    </div>
  </div>`;
}

function row(label, value, color = '#94a3b8') {
  return `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:160px">${label}</td><td style="padding:6px 0;color:${color};font-size:13px;font-weight:600">${value}</td></tr>`;
}

// ── Welcome Email ──────────────────────────────────
async function sendWelcomeMail(email, name) {
  const html = baseTemplate('Welcome to PRISM! 🎉', `
    <p style="color:#94a3b8;line-height:1.7">Hi <strong style="color:#fff">${name}</strong>,</p>
    <p style="color:#94a3b8;line-height:1.7">Welcome to <strong style="color:#2563eb">PRISM</strong> — India's most advanced Property Risk & Intelligence platform. Your account is now active.</p>
    <div style="background:#162040;border-radius:10px;padding:16px;margin:16px 0">
      <p style="margin:0 0 8px;font-size:13px;color:#64748b;letter-spacing:.5px">WHAT YOU CAN DO</p>
      <ul style="color:#94a3b8;font-size:13px;line-height:2;margin:0;padding-left:16px">
        <li>🏠 Search 29,000+ verified properties</li>
        <li>🤖 AI-powered price prediction using 4 ML models</li>
        <li>⚠️ Crime risk analysis for any Indian state</li>
        <li>📜 RERA and registry verification</li>
        <li>❤️ Save favourites and get alerts</li>
      </ul>
    </div>
    <a href="http://localhost:3000" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-top:8px">Open Dashboard →</a>
  `);
  return sendMail(email, '🏠 Welcome to PRISM — Property Risk Intelligence System', html);
}

// ── Prediction Result Email ────────────────────────
async function sendPredictionMail(email, name, result) {
  const { input, predictions, range, riskAssessment } = result;
  const html = baseTemplate('Price Prediction Ready 🤖', `
    <p style="color:#94a3b8">Hi <strong style="color:#fff">${name}</strong>, your ML prediction is complete.</p>
    <div style="background:#162040;border-radius:10px;padding:20px;margin:16px 0;text-align:center">
      <div style="font-size:11px;color:#64748b;letter-spacing:1px;margin-bottom:8px">PREDICTED PRICE (ENSEMBLE)</div>
      <div style="font-size:40px;font-weight:700;color:#fff;font-family:monospace">₹${predictions.ensemble}L</div>
      <div style="font-size:13px;color:#94a3b8;margin-top:4px">Range: ₹${range.low}L – ₹${range.high}L</div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      ${row('Location', `${input.city}${input.locality ? ', '+input.locality : ''}`)}
      ${row('Configuration', `${input.bhk} BHK | ${input.sqft} sqft`)}
      ${row('Linear Regression', `₹${predictions.linearRegression}L`, '#60a5fa')}
      ${row('Random Forest', `₹${predictions.randomForest}L`, '#34d399')}
      ${row('Gradient Boosting', `₹${predictions.gradientBoosting}L`, '#fbbf24')}
      ${row('Risk Level', riskAssessment.riskClass, riskAssessment.riskClass==='LOW'?'#10b981':riskAssessment.riskClass==='MEDIUM'?'#f59e0b':'#ef4444')}
    </table>
    <p style="font-size:12px;color:#64748b;margin-top:16px">⚠️ This is an AI-generated estimate. Actual market prices may vary. Always verify with a certified property valuer.</p>
  `, '#10b981');
  return sendMail(email, `🤖 PRISM ML Prediction: ${input.bhk}BHK in ${input.city} — ₹${predictions.ensemble}L`, html);
}

// ── Favourite Saved Email ──────────────────────────
async function sendFavouriteMail(email, name, property) {
  const html = baseTemplate('Property Saved to Favourites ❤️', `
    <p style="color:#94a3b8">Hi <strong style="color:#fff">${name}</strong>, you saved a property.</p>
    <div style="background:#162040;border-radius:10px;padding:20px;margin:16px 0">
      <div style="font-size:24px;text-align:center;margin-bottom:12px">🏠</div>
      <table style="width:100%;border-collapse:collapse">
        ${row('Address', `${property.locality}, ${property.city}`)}
        ${row('Price', `₹${property.price}L`, '#34d399')}
        ${row('Configuration', `${property.bhk} BHK | ${property.sqft} sqft`)}
        ${row('Risk Score', `${property.riskScore} (${property.riskLabel.toUpperCase()})`, property.riskLabel==='low'?'#10b981':property.riskLabel==='medium'?'#f59e0b':'#ef4444')}
        ${row('RERA', property.rera ? 'Approved ✓' : 'Not Registered', property.rera?'#10b981':'#f59e0b')}
      </table>
    </div>
    <a href="http://localhost:3000/favourites" style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px">View Favourites →</a>
  `, '#ef4444');
  return sendMail(email, `❤️ Saved: ${property.bhk}BHK in ${property.locality}, ${property.city} — ₹${property.price}L`, html);
}

// ── Enquiry Email ──────────────────────────────────
async function sendEnquiryMail(userEmail, userName, property) {
  const html = baseTemplate('Enquiry Confirmation 📧', `
    <p style="color:#94a3b8">Hi <strong style="color:#fff">${userName}</strong>, your enquiry has been sent.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      ${row('Property', `${property.bhk}BHK in ${property.locality}, ${property.city}`)}
      ${row('Price', `₹${property.price}L`)}
      ${row('Status', 'Enquiry Sent ✓', '#10b981')}
      ${row('Expected Response', '24-48 hours')}
    </table>
  `);
  return sendMail(userEmail, `📧 Enquiry Sent: ${property.bhk}BHK in ${property.city}`, html);
}

// ── Contact Acknowledgement ────────────────────────
async function sendContactAckMail(email, name, subject, ticketId) {
  const html = baseTemplate('We Received Your Message ✅', `
    <p style="color:#94a3b8">Hi <strong style="color:#fff">${name}</strong>, we've received your query.</p>
    <div style="background:#162040;border-radius:10px;padding:16px;margin:16px 0">
      ${row('Subject', subject)}
      ${row('Ticket ID', ticketId, '#a78bfa')}
      ${row('Expected Response', 'Within 24 hours')}
    </div>
  `, '#8b5cf6');
  return sendMail(email, `✅ Support Ticket #${ticketId}: ${subject}`, html);
}

module.exports = { sendWelcomeMail, sendPredictionMail, sendFavouriteMail, sendEnquiryMail, sendContactAckMail, sendMail };
