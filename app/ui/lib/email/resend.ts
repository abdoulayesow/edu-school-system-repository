import { Resend } from "resend"

// Initialize Resend client
// The API key should be set in the environment variable RESEND_API_KEY
const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey && process.env.NODE_ENV === "production") {
  console.warn("RESEND_API_KEY is not set. Email functionality will not work.")
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null

// Email configuration
export const EMAIL_FROM = process.env.EMAIL_FROM || "GSPN Management <noreply@gspn.gn>"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8000"

interface SendInvitationEmailParams {
  to: string
  inviteeName?: string
  inviterName: string
  role: string
  token: string
  expiresAt: Date
  locale?: "en" | "fr"
}

export async function sendInvitationEmail({
  to,
  inviteeName,
  inviterName,
  role,
  token,
  expiresAt,
  locale = "fr",
}: SendInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("Resend is not configured. Skipping email send.")
    return { success: false, error: "Email service not configured" }
  }

  const acceptUrl = `${APP_URL}/auth/accept-invitation?token=${token}`
  const expiresDate = expiresAt.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const roleLabels: Record<string, { fr: string; en: string }> = {
    director: { fr: "Directeur", en: "Director" },
    academic_director: { fr: "Directeur Académique", en: "Academic Director" },
    secretary: { fr: "Secrétaire", en: "Secretary" },
    accountant: { fr: "Comptable", en: "Accountant" },
    teacher: { fr: "Enseignant", en: "Teacher" },
  }

  const roleLabel = roleLabels[role]?.[locale] || role

  const subject = locale === "fr"
    ? `Invitation à rejoindre GSPN Management System`
    : `Invitation to join GSPN Management System`

  const html = locale === "fr" ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">GSPN Management System</h1>
  </div>

  <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Bonjour${inviteeName ? ` ${inviteeName}` : ''},</p>

    <p style="font-size: 16px;"><strong>${inviterName}</strong> vous invite à rejoindre le système de gestion GSPN en tant que <strong>${roleLabel}</strong>.</p>

    <p style="font-size: 16px;">Pour accepter cette invitation et créer votre compte, cliquez sur le bouton ci-dessous:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${acceptUrl}" style="display: inline-block; background: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Accepter l'invitation
      </a>
    </div>

    <p style="font-size: 14px; color: #666;">
      Ce lien expire le <strong>${expiresDate}</strong>.
    </p>

    <p style="font-size: 14px; color: #666;">
      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur:<br>
      <a href="${acceptUrl}" style="color: #1e40af; word-break: break-all;">${acceptUrl}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 12px; color: #999; text-align: center;">
      Cet email a été envoyé par le système de gestion GSPN.<br>
      Si vous n'avez pas demandé cette invitation, veuillez ignorer cet email.
    </p>
  </div>
</body>
</html>
` : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">GSPN Management System</h1>
  </div>

  <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hello${inviteeName ? ` ${inviteeName}` : ''},</p>

    <p style="font-size: 16px;"><strong>${inviterName}</strong> has invited you to join the GSPN Management System as a <strong>${roleLabel}</strong>.</p>

    <p style="font-size: 16px;">To accept this invitation and create your account, click the button below:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${acceptUrl}" style="display: inline-block; background: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Accept Invitation
      </a>
    </div>

    <p style="font-size: 14px; color: #666;">
      This link expires on <strong>${expiresDate}</strong>.
    </p>

    <p style="font-size: 14px; color: #666;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${acceptUrl}" style="color: #1e40af; word-break: break-all;">${acceptUrl}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 12px; color: #999; text-align: center;">
      This email was sent by the GSPN Management System.<br>
      If you didn't request this invitation, please ignore this email.
    </p>
  </div>
</body>
</html>
`

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Failed to send invitation email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("Error sending invitation email:", err)
    return { success: false, error: "Failed to send email" }
  }
}
