const nodemailer = require('nodemailer');

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

const esc = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const buildEmailHtml = ({ name, email, project_type, budget, message, privacy }) => {
  const safeMessage = esc(message).replace(/\n/g, '<br>');
  const now = new Date().toLocaleString('fr-FR', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Paris',
  });

  const row = (icon, label, value) => `
    <tr>
      <td style="padding:0 0 16px 0;vertical-align:top;width:36px">
        <div style="width:36px;height:36px;background:linear-gradient(135deg,#06A77D,#005377);border-radius:10px;text-align:center;line-height:36px;font-size:16px"><i class="${icon}" style="color:#fff;font-size:16px"></i></div>
      </td>
      <td style="padding:0 0 16px 12px;vertical-align:top">
        <div style="font-size:11px;font-weight:600;color:#06A77D;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px">${label}</div>
        <div style="font-size:15px;color:#052F5F;background:#F0F4F8;border-left:3px solid #06A77D;border-radius:0 8px 8px 0;padding:8px 12px;line-height:1.6">${value}</div>
      </td>
    </tr>`;

  return `<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @import url('https://cdn-uicons.flaticon.com/3.0.0/uicons-bold-rounded/css/uicons-bold-rounded.css');
    /* Responsive styles for email */
    @media only screen and (max-width: 600px) {
      .email-container { padding: 20px 10px !important; }
      .email-content { max-width: 100% !important; width: 100% !important; }
      .header-padding { padding: 30px 20px 24px !important; }
      .body-padding { padding: 24px 20px !important; }
      .cta-padding { padding: 0 20px 24px !important; }
      .footer-padding { padding: 0 20px 30px !important; }
      .divider-padding { padding: 0 20px !important; }
      .sender-padding { padding: 0 20px !important; }
      .avatar { width: 36px !important; height: 36px !important; line-height: 36px !important; font-size: 14px !important; }
      .sender-info { margin-left: 10px !important; }
      .sender-name { font-size: 14px !important; }
      .sender-email { font-size: 12px !important; }
      .badge { font-size: 11px !important; padding: 6px 12px !important; }
      .title { font-size: 22px !important; }
      .subtitle { font-size: 13px !important; }
      .cta-btn { font-size: 14px !important; padding: 12px 24px !important; }
      .footer-text { font-size: 12px !important; }
      .footer-small { font-size: 11px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#F0F4F8;font-family:'Afacad',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="background:#F0F4F8;padding:40px 16px">
    <tr><td align="center">
      <table class="email-content" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(5,47,95,0.12)">

        <!-- HEADER -->
        <tr>
          <td class="header-padding" style="background:linear-gradient(135deg,#052F5F 0%,#005377 60%,#06A77D 100%);padding:40px 40px 32px">
            <div class="badge" style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:12px;padding:8px 16px;margin-bottom:20px">
              <span style="color:#fff;font-size:13px;font-weight:600;letter-spacing:0.05em">⚡ Portfolio — dosenaterro.vercel.app</span>
            </div>
            <h1 class="title" style="margin:0 0 8px;font-size:26px;font-weight:700;color:#fff;line-height:1.2"><i class="fi fi-br-bell" style="color:#fff;margin-right:8px"></i>Nouveau message de contact</h1>
            <p class="subtitle" style="margin:0;font-size:14px;color:rgba(255,255,255,0.75)">Reçu le ${now}</p>
          </td>
        </tr>

        <!-- SENDER PILL -->
        <tr>
          <td class="sender-padding" style="padding:0 40px">
            <div style="background:linear-gradient(135deg,rgba(6,167,125,0.08),rgba(0,83,119,0.05));border:1px solid rgba(6,167,125,0.2);border-radius:0 0 16px 16px;padding:16px 20px">
              <div class="avatar" style="display:inline-block;width:44px;height:44px;background:linear-gradient(135deg,#06A77D,#005377);border-radius:50%;text-align:center;line-height:44px;font-size:18px;font-weight:700;color:#fff;vertical-align:middle">${esc(name).charAt(0).toUpperCase()}</div>
              <div class="sender-info" style="display:inline-block;vertical-align:middle;margin-left:12px">
                <div class="sender-name" style="font-size:16px;font-weight:700;color:#052F5F">${esc(name)}</div>
                <a href="mailto:${esc(email)}" class="sender-email" style="font-size:13px;color:#06A77D;text-decoration:none">${esc(email)}</a>
              </div>
            </div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td class="body-padding" style="padding:32px 40px">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row('fi fi-br-comment', 'Message', safeMessage)}
              ${row('fi fi-br-briefcase', 'Type de projet', esc(project_type) || '<span style="color:#6B7280;font-style:italic">Non spécifié</span>')}
              ${row('fi fi-br-dollar', 'Budget', esc(budget) || '<span style="color:#6B7280;font-style:italic">Non spécifié</span>')}
              ${row('fi fi-br-lock', 'Politique de confidentialité', privacy
                ? '<span style="color:#06A77D;font-weight:600">✓ Acceptée</span>'
                : '<span style="color:#DC2626">✗ Non acceptée</span>')}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td class="cta-padding" style="padding:0 40px 32px">
            <a href="mailto:${esc(email)}?subject=Re%3A%20Votre%20message&body=Bonjour%20${encodeURIComponent(name)}%2C%0A%0A"
               class="cta-btn" style="display:inline-block;background:linear-gradient(135deg,#06A77D,#005377);color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:12px;box-shadow:0 8px 24px rgba(6,167,125,0.35);transition:transform 0.2s ease">
              <i class="fi fi-br-reply" style="margin-right:8px"></i>Répondre à ${esc(name)}
            </a>
          </td>
        </tr>

        <!-- DIVIDER -->
        <tr><td class="divider-padding" style="padding:0 40px"><div style="height:1px;background:rgba(5,47,95,0.1);margin-bottom:24px"></div></td></tr>

        <!-- FOOTER -->
        <tr>
          <td class="footer-padding" style="padding:0 40px 40px">
            <p class="footer-text" style="margin:0 0 4px;font-size:13px;color:rgba(5,47,95,0.5)">Ce message a été envoyé depuis le formulaire de contact de votre portfolio.</p>
            <p class="footer-small" style="margin:0;font-size:12px;color:rgba(5,47,95,0.35)">Email généré automatiquement — répondez directement à l'expéditeur via le bouton ci-dessus.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

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

// Allowed origins: production + any localhost port for local testing
const ALLOWED_ORIGINS = [
  'https://dosenaterro.vercel.app',
  'http://localhost',
  'http://127.0.0.1',
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // allow requests with no origin (e.g. curl, Postman)
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow any localhost:PORT or 127.0.0.1:PORT
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
};

module.exports = async (req, res) => {
  const origin = req.headers.origin;

  // CORS
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Méthode non autorisée' });

  try {
    const { name, email, project_type, budget, message, privacy } = req.body;

    const errors = validateFormData(req.body);
    if (errors.length > 0)
      return res.status(400).json({ success: false, message: errors.join(', ') });

    const payload = {
      name: name.trim(), email: email.trim(),
      project_type, budget,
      message: message.trim(), privacy,
    };

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'dosenaterroa@gmail.com',
        pass: 'txchkcivywmkjffu',
      },
    });

    await transporter.sendMail({
      from: '"Portfolio Contact" <dosenaterroa@gmail.com>',
      to: 'dosenaterroa@gmail.com',
      replyTo: email.trim(),
      subject: `🔔 Nouveau contact — ${name.trim()}`,
      text: buildEmailText(payload),
      html: buildEmailHtml(payload),
    });

    return res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.',
    });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi du message. Veuillez réessayer ou me contacter directement.",
    });
  }
};