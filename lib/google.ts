import "server-only";
import { google, type Auth } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

let cachedAuth: Auth.JWT | null = null;

function getAuth() {
  if (cachedAuth) return cachedAuth;

  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error(
      "Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY environment variables.",
    );
  }
  // Allow both literal newlines and the escaped "\\n" form found in many .env files.
  const key = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;

  cachedAuth = new google.auth.JWT({
    email,
    key,
    scopes: SCOPES,
  });
  return cachedAuth;
}

export function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

export function getDrive() {
  return google.drive({ version: "v3", auth: getAuth() });
}

export function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("Missing GOOGLE_SHEET_ID env variable.");
  return id;
}

export function getSheetTab(): string {
  return process.env.GOOGLE_SHEET_TAB?.trim() || "DATA INPUT";
}

export function getDriveFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!id) throw new Error("Missing GOOGLE_DRIVE_FOLDER_ID env variable.");
  return id;
}
