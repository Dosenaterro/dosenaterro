const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: 'Trop de demandes depuis cette adresse IP, veuillez réessayer plus tard.' },
});
app.use('/api/contact', limiter);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Nodemailer transporter ────────────────────────────────────────────────────
const createTransporter = () => {
  if (process.env.NODE_ENV !== 'production') {
    // Ethereal test account for development
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'maddison53@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'jn7jnAPss4f63QBp6D',
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

// ── Validation ────────────────────────────────────────────────────────────────
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateFormData = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length < 2)
    errors.push('Le nom doit contenir au moins 2 caractères');
  if (!data.email || !validateEmail(data.email))
    errors.push('Adresse email invalide');
  if (!data.message || data.message.trim().length < 10)
    errors.push('Le message doit contenir au moins 10 caractères');
  if (!data.privacy)
    errors.push('Vous devez accepter la politique de confidentialité');
  return errors;
};

// ── Sanitise – prevent HTML injection in email ────────────────────────────────
const esc = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ── Beautiful HTML email (mirrors portfolio design system) ───────────────────
const buildEmailHtml = ({ name, email, project_type, budget, message, privacy }) => {
  const safeMessage = esc(message).replace(/\n/g, '<br>');
  const now = new Date().toLocaleString('fr-FR', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Paris',
  });

  const row = (icon, label, value) => `
    <tr>
      <td style="padding:0 0 16px 0;vertical-align:top;width:36px">
        <div style="
          width:36px;height:36px;
          background:linear-gradient(135deg,#06A77D,#005377);
          border-radius:10px;
          display:flex;align-items:center;justify-content:center;
          font-size:16px;line-height:36px;text-align:center;
        ">${icon}</div>
      </td>
      <td style="padding:0 0 16px 12px;vertical-align:top">
        <div style="font-size:11px;font-weight:600;color:#06A77D;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px">${label}</div>
        <div style="font-size:15px;color:#052F5F;background:#F0F4F8;border-left:3px solid #06A77D;border-radius:0 8px 8px 0;padding:8px 12px;line-height:1.6">${value}</div>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Nouveau message de contact</title>
</head>
<body style="margin:0;padding:0;background:#F0F4F8;font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F4F8;padding:40px 16px">
    <tr><td align="center">

      <!-- Card -->
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(5,47,95,0.12)">

        <!-- ── HEADER ── -->
        <tr>
          <td style="background:linear-gradient(135deg,#052F5F 0%,#005377 60%,#06A77D 100%);padding:40px 40px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <!-- Logo badge -->
                  <div style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:12px;padding:8px 16px;margin-bottom:20px">
                    <span style="color:#fff;font-size:13px;font-weight:600;letter-spacing:0.05em">⚡ Portfolio</span>
                  </div>
                  <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#fff;line-height:1.2">
                    🔔 Nouveau message de contact
                  </h1>
                  <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.75)">
                    Reçu le ${now}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── SENDER PILL ── -->
        <tr>
          <td style="padding:0 40px">
            <div style="
              background:linear-gradient(135deg,rgba(6,167,125,0.08),rgba(0,83,119,0.05));
              border:1px solid rgba(6,167,125,0.2);
              border-radius:0 0 16px 16px;
              padding:16px 20px;
              display:flex;align-items:center;gap:12px
            ">
              <div style="
                width:44px;height:44px;
                background:linear-gradient(135deg,#06A77D,#005377);
                border-radius:50%;
                display:inline-block;
                text-align:center;line-height:44px;
                font-size:18px;font-weight:700;color:#fff;
                flex-shrink:0
              ">${esc(name).charAt(0).toUpperCase()}</div>
              <div style="display:inline-block;vertical-align:middle;margin-left:12px">
                <div style="font-size:16px;font-weight:700;color:#052F5F">${esc(name)}</div>
                <a href="mailto:${esc(email)}" style="font-size:13px;color:#06A77D;text-decoration:none">${esc(email)}</a>
              </div>
            </div>
          </td>
        </tr>

        <!-- ── BODY ── -->
        <tr>
          <td style="padding:32px 40px">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row('💬', 'Message', safeMessage)}
              ${row('🗂️', 'Type de projet', esc(project_type) || '<span style="color:#aaa;font-style:italic">Non spécifié</span>')}
              ${row('💰', 'Budget', esc(budget) || '<span style="color:#aaa;font-style:italic">Non spécifié</span>')}
              ${row('🔒', 'Politique de confidentialité', privacy
                ? '<span style="color:#06A77D;font-weight:600">✓ Acceptée</span>'
                : '<span style="color:#DC2626">✗ Non acceptée</span>')}
            </table>
          </td>
        </tr>

        <!-- ── CTA BUTTON ── -->
        <tr>
          <td style="padding:0 40px 32px">
            <a href="mailto:${esc(email)}?subject=Re: Votre message&body=Bonjour ${esc(name)},%0A%0A"
               style="
                 display:inline-block;
                 background:linear-gradient(135deg,#06A77D,#005377);
                 color:#fff;font-size:15px;font-weight:600;
                 text-decoration:none;
                 padding:14px 28px;border-radius:12px;
                 box-shadow:0 8px 24px rgba(6,167,125,0.35);
               ">
              ↩ Répondre à ${esc(name)}
            </a>
          </td>
        </tr>

        <!-- ── DIVIDER ── -->
        <tr>
          <td style="padding:0 40px">
            <div style="height:1px;background:rgba(5,47,95,0.1);margin-bottom:24px"></div>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="padding:0 40px 40px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 4px;font-size:13px;color:rgba(5,47,95,0.5)">
                    Ce message a été envoyé depuis le formulaire de contact de votre portfolio.
                  </p>
                  <p style="margin:0;font-size:12px;color:rgba(5,47,95,0.35)">
                    Cet email est généré automatiquement — ne pas répondre directement à cet expéditeur.
                  </p>
                </td>
                <td align="right" style="white-space:nowrap">
                  <span style="
                    display:inline-block;
                    background:rgba(6,167,125,0.1);
                    border:1px solid rgba(6,167,125,0.25);
                    border-radius:20px;
                    padding:4px 12px;
                    font-size:11px;font-weight:600;
                    color:#06A77D;letter-spacing:0.05em;text-transform:uppercase
                  ">Portfolio</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
      <!-- /Card -->

    </td></tr>
  </table>

</body>
</html>`;
};

// ── Plain-text fallback ───────────────────────────────────────────────────────
const buildEmailText = ({ name, email, project_type, budget, message, privacy }) => `
Nouveau message de contact
===========================

De      : ${name} <${email}>
Projet  : ${project_type || 'Non spécifié'}
Budget  : ${budget || 'Non spécifié'}
RGPD    : ${privacy ? 'Acceptée' : 'Non acceptée'}

Message :
---------
${message}
`;

// ── POST /api/contact ─────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, project_type, budget, message, privacy } = req.body;

    const errors = validateFormData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const payload = { name: name.trim(), email: email.trim(), project_type, budget, message: message.trim(), privacy };

    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.FROM_EMAIL || 'noreply@yourdomain.com'}>`,
      to: process.env.TO_EMAIL || 'your-email@example.com',
      replyTo: email.trim(),
      subject: `🔔 Nouveau contact — ${name.trim()}`,
      text: buildEmailText(payload),
      html: buildEmailHtml(payload),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);

    if (process.env.NODE_ENV !== 'production') {
      console.log('📬 Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return res.json({
      success: true,
      message: 'Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.',
    });

  } catch (error) {
    console.error('❌ Email error:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi du message. Veuillez réessayer ou me contacter directement.",
    });
  }
});

// ── GET /api/health ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Error handlers ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email mode: ${process.env.NODE_ENV === 'production' ? 'Production SMTP' : 'Ethereal (dev)'}`);
});