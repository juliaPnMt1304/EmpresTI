import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const TAGS_PESSOA = new Set([
  "person", "people", "man", "woman", "men", "women", "girl", "boy",
  "child", "kid", "baby", "face", "portrait", "hand", "hands", "finger",
  "human", "student", "team", "crowd", "selfie", "businessman",
]);

export function hostPermitido(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" &&
      (parsed.hostname === "pixabay.com" || parsed.hostname.endsWith(".pixabay.com"));
  } catch {
    return false;
  }
}

export function tagsProibidas(tags) {
  const words = Array.isArray(tags) ? tags : String(tags ?? "").split(/[\s,;|]+/);
  return words.some((tag) => TAGS_PESSOA.has(String(tag).toLocaleLowerCase("en").replace(/[^a-z]/g, "")));
}

export async function redimensionar(buffer) {
  return sharp(buffer)
    .resize(800, 600, { fit: "cover" })
    .jpeg({ quality: 85 })
    .toBuffer();
}

export async function dimensaoOk(arquivo) {
  try {
    const metadata = await sharp(await readFile(arquivo)).metadata();
    return metadata.width === 800 && metadata.height === 600;
  } catch {
    return false;
  }
}

export function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function redigir(texto) {
  let safe = String(texto ?? "");
  const secret = process.env.PIXABAY_API_KEY;
  if (secret) safe = safe.split(secret).join("***");
  return safe.replace(/([?&]key=)[^&#\s"'<>]*/gi, "$1***");
}
