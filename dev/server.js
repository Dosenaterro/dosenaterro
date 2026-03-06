const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Trop de demandes depuis cette adresse IP, veuillez réessayer plus tard.'
});
app.use('/api/contact', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create Nodemailer transporter
const createTransporter = () => {
  // For development/testing with Ethereal
  if (process.env.NODE_ENV !== 'production') {
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'maddison53@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'jn7jnAPss4f63QBp6D'
      }
    });
  }

  // For production - replace with your actual SMTP settings
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateFormData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Adresse email invalide');
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push('Le message doit contenir au moins 10 caractères');
  }

  if (!data.privacy) {
    errors.push('Vous devez accepter la politique de confidentialité');
  }

  return errors;
};

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, project_type, budget, message, privacy } = req.body;

    // Validate form data
    const validationErrors = validateFormData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', ')
      });
    }

    // Prepare email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .value { background: white; padding: 8px; border-radius: 4px; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔔 Nouveau message de contact</h2>
              <p>Vous avez reçu un nouveau message depuis votre portfolio.</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nom:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${email}</div>
              </div>
              <div class="field">
                <div class="label">Type de projet:</div>
                <div class="value">${project_type || 'Non spécifié'}</div>
              </div>
              <div class="field">
                <div class="label">Budget:</div>
                <div class="value">${budget || 'Non spécifié'}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="field">
                <div class="label">Politique de confidentialité:</div>
                <div class="value">${privacy ? 'Acceptée' : 'Non acceptée'}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Nouveau message de contact:

Nom: ${name}
Email: ${email}
Type de projet: ${project_type || 'Non spécifié'}
Budget: ${budget || 'Non spécifié'}

Message:
${message}

Politique de confidentialité: ${privacy ? 'Acceptée' : 'Non acceptée'}
    `;

    // Email options
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.FROM_EMAIL || 'noreply@yourdomain.com'}>`,
      to: process.env.TO_EMAIL || 'your-email@example.com',
      subject: `🔔 Nouveau contact - ${name}`,
      text: emailText,
      html: emailHtml,
      replyTo: email
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    // For Ethereal testing, log the preview URL
    if (process.env.NODE_ENV !== 'production' && info.messageId) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    res.json({
      success: true,
      message: 'Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message. Veuillez réessayer ou me contacter directement.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.NODE_ENV === 'production' ? 'Production SMTP' : 'Ethereal (Test)'}`);
});
