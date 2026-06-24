import { readFileSync } from "node:fs";
import path from "node:path";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
  [key: string]: unknown;
};

function parseServiceAccountJson(raw: string): ServiceAccountCredentials | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "client_email" in parsed &&
      "private_key" in parsed &&
      typeof (parsed as ServiceAccountCredentials).client_email === "string" &&
      typeof (parsed as ServiceAccountCredentials).private_key === "string"
    ) {
      return parsed as ServiceAccountCredentials;
    }
    return null;
  } catch {
    return null;
  }
}

export function getGa4PropertyId(): string | null {
  const raw = process.env.GA4_PROPERTY_ID?.trim();
  if (!raw) return null;

  const numeric = raw.replace(/^properties\//, "").replace(/\D/g, "");
  return numeric.length > 0 ? numeric : null;
}

export function getGa4ServiceAccountCredentials(): ServiceAccountCredentials | null {
  const inlineJson = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineJson) {
    return parseServiceAccountJson(inlineJson);
  }

  const filePath = process.env.GA4_SERVICE_ACCOUNT_PATH?.trim();
  if (!filePath) return null;

  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    const raw = readFileSync(absolutePath, "utf8");
    return parseServiceAccountJson(raw);
  } catch {
    return null;
  }
}

export function isGa4Configured(): boolean {
  return getGa4PropertyId() !== null && getGa4ServiceAccountCredentials() !== null;
}
