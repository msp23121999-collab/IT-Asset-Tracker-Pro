/**
 * Supabase Edge Function Email Templates
 * Deno compatible.
 */

interface TemplateData {
  employeeName: string;
  assetName: string;
  assetId: string;
  warrantyEndDate: string;
  daysRemaining: 20 | 5;
}

const BRAND_COLOR = '#18B6FF';
const DANGER_COLOR = '#FF4D4D';
const WARNING_COLOR = '#FFB020';

function baseTemplate(title: string, accentColor: string, icon: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0B1426;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0D1B32,#162844);border:1px solid #19304D;border-radius:12px 12px 0 0;padding:30px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">${icon}</div>
      <h1 style="color:${accentColor};font-size:20px;font-weight:700;margin:0;letter-spacing:-0.3px;">${title}</h1>
      <p style="color:#94A3B8;font-size:12px;margin:8px 0 0;">IT Asset Tracker Pro — Automated Notification</p>
    </div>
    
    <!-- Body -->
    <div style="background:#0D1B32;border-left:1px solid #19304D;border-right:1px solid #19304D;padding:24px;">
      ${body}
    </div>
    
    <!-- Footer -->
    <div style="background:#071224;border:1px solid #19304D;border-radius:0 0 12px 12px;padding:20px 24px;text-align:center;">
      <p style="color:#475569;font-size:11px;margin:0;">This is an automated message from IT Asset Tracker Pro.</p>
      <p style="color:#475569;font-size:11px;margin:4px 0 0;">Please do not reply to this email. Contact your IT department for assistance.</p>
    </div>
    
  </div>
</body>
</html>`;
}

function assetInfoBlock(data: TemplateData, color: string): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #19304D;color:#94A3B8;font-size:13px;width:140px;">Employee</td>
        <td style="padding:10px 12px;border-bottom:1px solid #19304D;color:#E2E8F0;font-size:13px;font-weight:600;">${data.employeeName}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #19304D;color:#94A3B8;font-size:13px;">Asset Name</td>
        <td style="padding:10px 12px;border-bottom:1px solid #19304D;color:#E2E8F0;font-size:13px;">${data.assetName}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #19304D;color:#94A3B8;font-size:13px;">Asset ID</td>
        <td style="padding:10px 12px;border-bottom:1px solid #19304D;color:#E2E8F0;font-size:13px;font-family:monospace;">${data.assetId}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #19304D;color:#94A3B8;font-size:13px;">Warranty Ends</td>
        <td style="padding:10px 12px;border-bottom:1px solid #19304D;color:#E2E8F0;font-size:13px;font-weight:600;">${data.warrantyEndDate}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #19304D;color:#94A3B8;font-size:13px;">Days Remaining</td>
        <td style="padding:10px 12px;border-bottom:1px solid #19304D;color:${color};font-size:13px;font-weight:700;">${data.daysRemaining} days</td>
      </tr>
    </table>`;
}

export function warranty20DayNotice(data: TemplateData): string {
  return baseTemplate('Warranty Expiration Notice - 20 Days Remaining', WARNING_COLOR, '⚠️', `
    <p style="color:#E2E8F0;font-size:14px;line-height:1.6;margin:0 0 16px;">
      Hello <strong>${data.employeeName}</strong>,
    </p>
    <p style="color:#CBD5E1;font-size:14px;line-height:1.6;margin:0 0 16px;">
      Your assigned asset warranty will expire in <strong style="color:${WARNING_COLOR};">20 days</strong>.
    </p>
    ${assetInfoBlock(data, WARNING_COLOR)}
  `);
}

export function warranty5DayNotice(data: TemplateData): string {
  return baseTemplate('Urgent Warranty Expiration Notice - 5 Days Remaining', DANGER_COLOR, '🔴', `
    <p style="color:#E2E8F0;font-size:14px;line-height:1.6;margin:0 0 16px;">
      Hello <strong>${data.employeeName}</strong>,
    </p>
    <p style="color:#CBD5E1;font-size:14px;line-height:1.6;margin:0 0 16px;">
      <strong style="color:${DANGER_COLOR};">URGENT:</strong> Your assigned asset warranty will expire in 
      <strong style="color:${DANGER_COLOR};">5 days</strong>.
    </p>
    ${assetInfoBlock(data, DANGER_COLOR)}
    <div style="background:rgba(255,77,77,0.08);border:1px solid rgba(255,77,77,0.2);border-radius:8px;padding:12px 16px;margin-top:16px;">
      <p style="color:${DANGER_COLOR};font-size:13px;font-weight:600;margin:0;">🚨 Action Required</p>
      <p style="color:#CBD5E1;font-size:13px;margin:6px 0 0;">Please contact the IT department if action is required.</p>
    </div>
  `);
}
