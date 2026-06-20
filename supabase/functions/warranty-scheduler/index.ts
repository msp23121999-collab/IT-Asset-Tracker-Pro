import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { differenceInCalendarDays, parseISO, isValid } from "npm:date-fns@3.6.0";
import { warranty20DayNotice, warranty5DayNotice } from "./templates.ts";
import { SignJWT, importPKCS8 } from "npm:jose@5.2.4";

let transporter: any;
let isInitialized = false;
let serviceAccount: any;
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const privateKey = await importPKCS8(serviceAccount.private_key, 'RS256');
  const jwt = await new SignJWT({
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/datastore'
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const data = await tokenRes.json();
  if (!data.access_token) {
    throw new Error("Failed to generate access token: " + JSON.stringify(data));
  }

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000; // Buffer of 60s
  return cachedToken;
}

async function initialize() {
  if (isInitialized) return;

  const { default: nodemailer } = await import("npm:nodemailer@6.9.13");

  const serviceAccountBase64 = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_BASE64");
  if (!serviceAccountBase64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set");
  }
  
  const cleanBase64 = serviceAccountBase64.replace(/\s+/g, '');
  serviceAccount = JSON.parse(atob(cleanBase64));

  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPass = Deno.env.get("SMTP_PASS");

  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP_USER or SMTP_PASS not set in environment");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
  
  isInitialized = true;
}

function parseDocument(doc: any) {
  const data: any = {};
  for (const [key, value] of Object.entries(doc.fields || {})) {
    const type = Object.keys(value as any)[0];
    data[key] = (value as any)[type];
  }
  return data;
}

async function sendEmailAndLog(
  asset: any,
  docName: string,
  daysRemaining: 20 | 5
) {
  const is20Days = daysRemaining === 20;
  const emailType = is20Days ? "warranty_20_days" : "warranty_5_days";
  const title = is20Days 
    ? "Warranty Expiration Notice - 20 Days Remaining" 
    : "Urgent Warranty Expiration Notice - 5 Days Remaining";
  const html = is20Days 
    ? warranty20DayNotice({
        employeeName: asset.assignedToName,
        assetName: asset.name || asset.model,
        assetId: asset.assetId,
        warrantyEndDate: asset.warrantyEnd,
        daysRemaining: 20,
      })
    : warranty5DayNotice({
        employeeName: asset.assignedToName,
        assetName: asset.name || asset.model,
        assetId: asset.assetId,
        warrantyEndDate: asset.warrantyEnd,
        daysRemaining: 5,
      });

  let deliveryStatus = "failed";

  try {
    await transporter.sendMail({
      from: `"IT Asset Tracker" <${Deno.env.get("SMTP_USER")}>`,
      to: asset.assignedToEmail,
      subject: title,
      html: html,
    });
    deliveryStatus = "success";
    console.log(`Successfully sent ${daysRemaining}-day notice to ${asset.assignedToEmail} for ${asset.assetId}`);

    const token = await getAccessToken();

    const fieldToUpdate = is20Days ? "twentyDayReminderSent" : "fiveDayReminderSent";
    await fetch(`https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=${fieldToUpdate}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fields: { [fieldToUpdate]: { booleanValue: true } } })
    });

    await fetch(`https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases/(default)/documents/notifications`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        fields: {
          recipientUid: { stringValue: asset.assignedTo },
          recipientEmail: { stringValue: asset.assignedToEmail },
          title: { stringValue: title },
          message: { stringValue: `Your assigned asset warranty (${asset.model}) will expire in ${daysRemaining} days.` },
          type: { stringValue: "warranty" },
          isRead: { booleanValue: false },
          createdAt: { stringValue: new Date().toISOString() },
          assetId: { stringValue: asset.assetId },
        }
      })
    });
  } catch (error) {
    console.error(`Failed to send email to ${asset.assignedToEmail}:`, error);
  }

  try {
    const token = await getAccessToken();
    await fetch(`https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases/(default)/documents/audit_logs`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        fields: {
          action: { stringValue: "EMAIL_SENT" },
          details: { stringValue: `Sent ${emailType} to ${asset.assignedToEmail}` },
          userEmail: { stringValue: "system" },
          timestamp: { stringValue: new Date().toISOString() },
          metadata: { mapValue: { fields: {
            recipientEmail: { stringValue: asset.assignedToEmail },
            emailType: { stringValue: emailType },
            assetId: { stringValue: asset.assetId },
            daysRemaining: { integerValue: daysRemaining.toString() },
            deliveryStatus: { stringValue: deliveryStatus },
          }}}
        }
      })
    });
  } catch (e) {
    console.error("Audit log failed", e);
  }
}

async function runWarrantyCheck() {
  console.log("Starting daily warranty check...");

  try {
    await initialize();

    const token = await getAccessToken();

    // Query ALL assets using simple GET (to avoid complex structuredQuery 403 errors)
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases/(default)/documents/assets`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch assets: " + await res.text());
    }

    const results = await res.json();
    let count = 0;
    
    // The simple GET returns { documents: [ { name: "...", fields: { ... } } ] }
    const documents = results.documents || [];

    for (const doc of documents) {
      const docName = doc.name;
      const asset = parseDocument(doc);
      
      // Filter in memory to replace the "IN" query
      if (asset.status !== "active" && asset.status !== "in_use") {
        continue;
      }

      if (!asset.assignedTo || !asset.assignedToEmail || !asset.warrantyEnd) {
        continue;
      }

      const endDate = parseISO(asset.warrantyEnd);
      if (!isValid(endDate)) continue;

      const daysLeft = differenceInCalendarDays(endDate, new Date());

      if (daysLeft === 20 && !asset.twentyDayReminderSent) {
        await sendEmailAndLog(asset, docName, 20);
        count++;
      } else if (daysLeft === 5 && !asset.fiveDayReminderSent) {
        await sendEmailAndLog(asset, docName, 5);
        count++;
      }
    }
    return `Processed assets, sent ${count} emails.`;
  } catch (error: any) {
    console.error("Error during warranty check:", error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === "POST" || req.method === "GET") {
    try {
      const result = await runWarrantyCheck();
      return new Response(result, { status: 200 });
    } catch (e: any) {
      return new Response(`Error: ${e.message}\n${e.stack}`, { status: 500 });
    }
  }
  return new Response("Method not allowed", { status: 405 });
});
