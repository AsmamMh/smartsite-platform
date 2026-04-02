import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Email configuration
    // For development, uses Ethereal test email service (no actual email sent)
    // For production, set EMAIL_USER and EMAIL_PASSWORD environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (emailUser && emailPassword) {
      // Production: Use Gmail or other SMTP service
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || '',
        },
      });
    }
  }

  async sendApprovalEmail(
    userEmail: string,
    firstName: string,
    lastName: string,
    cin: string,
    password: string,
  ): Promise<void> {
    console.log('📧 EMAIL SERVICE: Début envoi email à', userEmail);
    console.log('📧 EMAIL SERVICE: Utilisateur', firstName, lastName);

    const subject = 'Votre compte SmartSite a été approuvé';
    const htmlContent = `
      <h2>Bienvenue sur SmartSite</h2>
      <p>Bonjour ${firstName} ${lastName},</p>
      <p>Votre compte a été approuvé avec succès. Vous pouvez maintenant accéder à la plateforme.</p>
      
      <h3>Vos informations d'accès:</h3>
      <table style="border-collapse: collapse; border: 1px solid #ddd;">
        <tr style="background-color: #f2f2f2;">
          <td style="border: 1px solid #ddd; padding: 12px;"><strong>CIN:</strong></td>
          <td style="border: 1px solid #ddd; padding: 12px;"><code>${cin}</code></td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 12px;"><strong>Mot de passe:</strong></td>
          <td style="border: 1px solid #ddd; padding: 12px;"><code>${password}</code></td>
        </tr>
        <tr style="background-color: #f2f2f2;">
          <td style="border: 1px solid #ddd; padding: 12px;"><strong>URL d'accès:</strong></td>
          <td style="border: 1px solid #ddd; padding: 12px;"><a href="http://localhost:5173/login">http://localhost:5173/login</a></td>
        </tr>
      </table>

      <h3>Recommandations de sécurité:</h3>
      <ul>
        <li>Gardez votre CIN et votre mot de passe en lieu sûr</li>
        <li>Ne partagez pas vos identifiants avec d'autres personnes</li>
        <li>Changez votre mot de passe dès votre première connexion</li>
      </ul>

      <p>Si vous avez des questions ou besoin d'assistance, veuillez contacter l'équipe d'administration.</p>
      <p>Cordialement,<br/>L'équipe SmartSite</p>
    `;

    try {
      console.log('📧 EMAIL SERVICE: Préparation envoi...');
      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@smartsite.com',
        to: userEmail,
        subject,
        html: htmlContent,
      });

      console.log('✅ EMAIL SERVICE: Email envoyé avec succès !');
      console.log('📧 EMAIL SERVICE: Message ID:', result.messageId);

      // Log preview URL for development
      if (!process.env.EMAIL_USER) {
        console.log(
          '\n📧 EMAIL SENT - Preview URL:',
          nodemailer.getTestMessageUrl(result),
        );
        console.log('📧 You can view the email at the URL above.\n');
      } else {
        console.log('📧 EMAIL SERVICE: Email envoyé via Gmail à', userEmail);
      }
    } catch (error) {
      console.error('❌ EMAIL SERVICE: Erreur envoi email:', error);
      throw error;
    }
  }

  async sendRejectionEmail(
    userEmail: string,
    firstName: string,
    lastName: string,
    cin: string,
    reason: string,
  ): Promise<void> {
    console.log('📧 EMAIL SERVICE: Début envoi email de rejet à', userEmail);
    console.log('📧 EMAIL SERVICE: Utilisateur', firstName, lastName);
    console.log('📧 EMAIL SERVICE: Motif:', reason);

    const subject = 'Votre demande de compte SmartSite a été refusée';
    const htmlContent = `
      <h2>Demande de compte SmartSite refusée</h2>
      <p>Bonjour ${firstName} ${lastName},</p>
      <p>Nous vous informons que votre demande de création de compte sur la plateforme SmartSite a été examinée et malheureusement refusée.</p>
      
      <h3>Raison du refus:</h3>
      <div style="background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #dc3545;">${reason}</p>
      </div>
      
      <h3>Informations de votre demande:</h3>
      <table style="border-collapse: collapse; border: 1px solid #ddd;">
        <tr style="background-color: #f2f2f2;">
          <td style="border: 1px solid #ddd; padding: 12px;"><strong>CIN:</strong></td>
          <td style="border: 1px solid #ddd; padding: 12px;"><code>${cin}</code></td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 12px;"><strong>Email:</strong></td>
          <td style="border: 1px solid #ddd; padding: 12px;">${userEmail}</td>
        </tr>
        <tr style="background-color: #f2f2f2;">
          <td style="border: 1px solid #ddd; padding: 12px;"><strong>Date de demande:</strong></td>
          <td style="border: 1px solid #ddd; padding: 12px;">${new Date().toLocaleDateString()}</td>
        </tr>
      </table>

      <h3>Que faire maintenant ?</h3>
      <ul>
        <li>Si vous pensez qu'il s'agit d'une erreur, vous pouvez contacter l'administration</li>
        <li>Vous pouvez soumettre une nouvelle demande si vous avez corrigé les problèmes mentionnés</li>
        <li>Pour toute question, veuillez contacter l'équipe d'administration</li>
      </ul>

      <p>Nous vous remercions de votre intérêt pour la plateforme SmartSite.</p>
      <p>Cordialement,<br/>L'équipe SmartSite</p>
    `;

    try {
      console.log('📧 EMAIL SERVICE: Préparation envoi email de rejet...');
      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@smartsite.com',
        to: userEmail,
        subject,
        html: htmlContent,
      });

      console.log('✅ EMAIL SERVICE: Email de rejet envoyé avec succès !');
      console.log('📧 EMAIL SERVICE: Message ID:', result.messageId);

      // Log preview URL for development
      if (!process.env.EMAIL_USER) {
        console.log(
          '\n📧 REJECTION EMAIL SENT - Preview URL:',
          nodemailer.getTestMessageUrl(result),
        );
        console.log('📧 You can view the rejection email at the URL above.\n');
      } else {
        console.log(
          '📧 EMAIL SERVICE: Email de rejet envoyé via Gmail à',
          userEmail,
        );
      }
    } catch (error) {
      console.error('❌ EMAIL SERVICE: Erreur envoi email de rejet:', error);
      throw error;
    }
  }

  async sendOTPEmail(
    email: string,
    firstName: string,
    otp: string,
  ): Promise<void> {
    console.log('📧 EMAIL SERVICE: Envoi OTP à', email);

    const subject = 'Votre code de vérification SmartSite';
    const htmlContent = `
      <h2>Vérification de votre email</h2>
      <p>Bonjour ${firstName},</p>
      <p>Votre code de vérification pour la plateforme SmartSite est:</p>
      
      <div style="background-color: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
      </div>
      
      <p><strong>Ce code expirera dans 10 minutes.</strong></p>
      
      <h3>Instructions:</h3>
      <ol>
        <li>Retournez à la page de vérification</li>
        <li>Entrez le code ci-dessus</li>
        <li>Cliquez sur "Vérifier"</li>
      </ol>
      
      <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
      <p>Pour toute question, contactez l'équipe d'administration.</p>
      <p>Cordialement,<br/>L'équipe SmartSite</p>
    `;

    try {
      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@smartsite.com',
        to: email,
        subject,
        html: htmlContent,
      });

      console.log('✅ EMAIL SERVICE: OTP envoyé avec succès !');
      console.log('📧 EMAIL SERVICE: Message ID:', result.messageId);
    } catch (error) {
      console.error('❌ EMAIL SERVICE: Erreur envoi OTP:', error);
      throw error;
    }
  }

  async sendTemporaryPasswordEmail(
    email: string,
    firstName: string,
    lastName: string,
    cin: string,
    temporaryPassword: string,
  ): Promise<void> {
    console.log('📧 EMAIL SERVICE: Envoi mot de passe temporaire à', email);

    const subject = 'Votre compte SmartSite a été créé';
    const htmlContent = `
      <h2>Bienvenue sur SmartSite</h2>
      <p>Bonjour ${firstName} ${lastName},</p>
      <p>Un compte a été créé pour vous sur la plateforme SmartSite.</p>
      
      <h3>Vos informations de connexion:</h3>
      <table style="border-collapse: collapse; border: 1px solid #ddd;">
        <tr style="background-color: #f2f2f2;">
          <td style="border: 1px solid #ddd; padding: 12px;"><strong>CIN:</strong></td>
          <td style="border: 1px solid #ddd; padding: 12px;"><code>${cin}</code></td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 12px;"><strong>Mot de passe temporaire:</strong></td>
          <td style="border: 1px solid #ddd; padding: 12px;"><code>${temporaryPassword}</code></td>
        </tr>
        <tr style="background-color: #f2f2f2;">
          <td style="border: 1px solid #ddd; padding: 12px;"><strong>URL d'accès:</strong></td>
          <td style="border: 1px solid #ddd; padding: 12px;"><a href="http://localhost:5173/login">http://localhost:5173/login</a></td>
        </tr>
      </table>

      <h3>Instructions importantes:</h3>
      <ul>
        <li>Utilisez votre CIN et ce mot de passe temporaire pour vous connecter</li>
        <li>Vous devrez changer votre mot de passe dès la première connexion</li>
        <li>Gardez vos identifiants en lieu sûr</li>
      </ul>

      <p>Si vous avez des questions, contactez l'équipe d'administration.</p>
      <p>Cordialement,<br/>L'équipe SmartSite</p>
    `;

    try {
      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@smartsite.com',
        to: email,
        subject,
        html: htmlContent,
      });

      console.log(
        '✅ EMAIL SERVICE: Mot de passe temporaire envoyé avec succès !',
      );
      console.log('📧 EMAIL SERVICE: Message ID:', result.messageId);
    } catch (error) {
      console.error(
        '❌ EMAIL SERVICE: Erreur envoi mot de passe temporaire:',
        error,
      );
      throw error;
    }
  }
}
