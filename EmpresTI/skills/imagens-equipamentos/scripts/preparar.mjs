import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import dotenv from "dotenv";
import { dimensaoOk, hostPermitido, redigir, redimensionar, sha256, tagsProibidas } from "./lib.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "../../..");
const CATALOG_PATH = path.join(ROOT, "skills/imagens-equipamentos/equipamentos.json");
const CREDITS_PATH = path.join(ROOT, "data/imagens/creditos.json");
const BUILD_DIR = path.join(ROOT, "imagens-build");
const CACHE_DIR = path.join(BUILD_DIR, "cache");
const REVIEW_PATH = path.join(BUILD_DIR, "revisao.html");
const REVIEW_CHECKLIST = path.join(ROOT, "skills/imagens-equipamentos/references/revisao-visual.md");
const CACHE_MS = 24 * 60 * 60 * 1000;
const API_URL = "https://pixabay.com/api/";
const API_PARAMS = {
  image_type: "photo",
  safesearch: "true",
  orientation: "horizontal",
  min_width: "800",
  min_height: "600",
  per_page: "20",
  lang: "en",
};
const requestTimes = [];

function logError(error) {
  console.error(redigir(error?.stack ?? error?.message ?? error));
}

function parseArgs(argv) {
  const options = { approve: [], reject: "", reviewer: "", reason: "" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--aprovar") options.approve = (argv[++i] ?? "").split(",").filter(Boolean);
    else if (arg === "--revisor") options.reviewer = argv[++i] ?? "";
    else if (arg === "--reprovar") options.reject = argv[++i] ?? "";
    else if (arg === "--motivo") options.reason = argv[++i] ?? "";
    else throw new Error(`Argumento desconhecido: ${arg}`);
  }
  if (options.approve.length && !options.reviewer.trim()) {
    throw new Error("--aprovar exige --revisor \"Nome\".");
  }
  if (options.reject && !options.reason.trim()) {
    throw new Error("--reprovar exige --motivo \"texto\".");
  }
  return options;
}

async function readJson(file, fallback) {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function saveCredits(records) {
  await mkdir(path.dirname(CREDITS_PATH), { recursive: true });
  await writeFile(CREDITS_PATH, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function fileFor(item) {
  return path.join(BUILD_DIR, `${item.patrimonio}.jpg`);
}

function rejectedFor(record, id, digest) {
  return (record?.rejeitados ?? []).some((entry) =>
    (String(entry.id) === String(id) || !id) || (entry.sha256 && entry.sha256 === digest));
}

async function waitForRateSlot() {
  const now = Date.now();
  while (requestTimes.length && now - requestTimes[0] >= 60_000) requestTimes.shift();
  if (requestTimes.length >= 100) {
    await new Promise((resolve) => setTimeout(resolve, 60_000 - (now - requestTimes[0])));
    return waitForRateSlot();
  }
  requestTimes.push(Date.now());
}

async function searchPixabay(query, apiKey) {
  const cacheKey = createHash("sha256").update(JSON.stringify({ q: query, ...API_PARAMS })).digest("hex");
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  if (existsSync(cachePath)) {
    const cached = await readJson(cachePath, null);
    if (cached && Date.now() - cached.cachedAt < CACHE_MS) return cached.payload;
  }

  await waitForRateSlot();
  const url = new URL(API_URL);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  for (const [name, value] of Object.entries(API_PARAMS)) url.searchParams.set(name, value);

  let response;
  try { response = await fetch(url); }
  catch (error) { throw new Error(`Falha de rede ao consultar Pixabay: ${redigir(error.message)}`); }
  if (response.status === 429) {
    throw new Error("Pixabay respondeu HTTP 429: limite de requisições atingido. Aguarde 60 segundos antes de tentar novamente.");
  }
  if (!response.ok) throw new Error(`Pixabay respondeu HTTP ${response.status}: ${redigir(await response.text())}`);

  const payload = await response.json();
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(cachePath, `${JSON.stringify({ cachedAt: Date.now(), payload }, null, 2)}\n`, "utf8");
  return payload;
}

async function downloadImage(url) {
  if (!hostPermitido(url)) return null;
  let response;
  try { response = await fetch(url); }
  catch (error) { throw new Error(`Falha ao baixar imagem Pixabay: ${redigir(error.message)}`); }
  if (!response.ok) throw new Error(`Falha ao baixar imagem Pixabay: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function initialRecord(item) {
  return {
    patrimonio: item.patrimonio,
    arquivo: `imagens-build/${item.patrimonio}.jpg`,
    fonte: "Pixabay",
    pixabay_id: null,
    pageURL: "",
    user: "",
    user_id: null,
    licenca: "Pixabay Content License",
    busca: item.busca,
    tags: "",
    sha256: "",
    baixado_em: "",
    status: "pendente",
    motivo: "",
    rejeitados: [],
  };
}

async function makeReview(items, records) {
  const checklist = await readFile(REVIEW_CHECKLIST, "utf8");
  const recordsByPatrimony = new Map(records.map((record) => [record.patrimonio, record]));
  const cards = await Promise.all(items.map(async (item) => {
    const record = recordsByPatrimony.get(item.patrimonio);
    const imagePath = fileFor(item);
    const hasImage = record && existsSync(imagePath) && await dimensaoOk(imagePath);
    const image = hasImage
      ? `<img src="${item.patrimonio}.jpg" alt="${escapeHtml(item.nome)}">`
      : `<div class="missing">Foto ainda não preparada</div>`;
    const credit = record?.user
      ? `Pixabay · ${escapeHtml(record.user)} · <a href="${escapeHtml(record.pageURL)}">origem</a>`
      : "Pixabay · crédito pendente";
    return `<article><h2>${escapeHtml(item.patrimonio)} — ${escapeHtml(item.nome)}</h2>${image}<p>${credit}</p><p>Status: ${escapeHtml(record?.status ?? "pendente")}</p><p>Motivo: ${escapeHtml(record?.motivo || "—")}</p></article>`;
  }));
  const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Revisão de imagens</title><style>body{font:16px system-ui;margin:2rem;background:#f4f5f7;color:#18202a}main{max-width:1200px;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem}article{background:white;border:1px solid #ccd2dc;border-radius:8px;padding:1rem}img,.missing{width:100%;aspect-ratio:4/3;object-fit:cover}.missing{display:grid;place-items:center;background:#e5e8ed}a{color:#174ea6}</style><main><h1>Revisão humana das fotos</h1><p><a href="https://pixabay.com">Fotos: Pixabay</a></p><section class="grid">${cards.join("\n")}</section><section><h2>Checklist de revisão</h2><pre>${escapeHtml(checklist)}</pre></section></main></html>`;
  await mkdir(BUILD_DIR, { recursive: true });
  await writeFile(REVIEW_PATH, html, "utf8");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

async function run() {
  dotenv.config({ path: path.join(ROOT, ".env.local"), quiet: true });
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) throw new Error("PIXABAY_API_KEY não encontrada em .env.local.");
  const options = parseArgs(process.argv.slice(2));
  const items = await readJson(CATALOG_PATH, null);
  if (!Array.isArray(items) || items.length !== 12) throw new Error("equipamentos.json deve conter os 12 itens do catálogo.");
  let records = await readJson(CREDITS_PATH, []);
  if (!Array.isArray(records)) throw new Error("creditos.json precisa conter uma lista JSON.");
  const byPatrimony = new Map(records.map((record) => [record.patrimonio, record]));

  if (options.reject) {
    const record = byPatrimony.get(options.reject);
    if (!record?.pixabay_id || !record?.sha256) throw new Error(`Não há imagem preparada para reprovar em ${options.reject}.`);
    record.rejeitados ??= [];
    record.rejeitados.push({ id: record.pixabay_id, sha256: record.sha256 });
    record.motivo = options.reason.trim();
    record.status = "pendente";
    await rm(fileFor({ patrimonio: options.reject }), { force: true });
    await saveCredits(records);
  }

  for (const patrimonio of options.approve) {
    const record = byPatrimony.get(patrimonio);
    if (!record || !existsSync(fileFor({ patrimonio })) || !await dimensaoOk(fileFor({ patrimonio }))) {
      throw new Error(`Não é possível aprovar ${patrimonio}: imagem final 800x600 não encontrada.`);
    }
    record.status = "aprovada";
    record.revisor = options.reviewer.trim();
    record.revisado_em = new Date().toISOString();
    record.motivo = "";
  }
  await saveCredits(records);

  const usedIds = new Set();
  const usedHashes = new Set();
  for (const item of items) {
    const record = byPatrimony.get(item.patrimonio);
    const output = fileFor(item);
    if (record && (record.status === "aprovada" || (record.status === "pendente" && existsSync(output) && await dimensaoOk(output)))) {
      if (record.pixabay_id) usedIds.add(String(record.pixabay_id));
      if (record.sha256) usedHashes.add(record.sha256);
      continue;
    }

    const rejectedRecord = record ?? initialRecord(item);
    const payload = await searchPixabay(item.busca, apiKey);
    const hits = Array.isArray(payload?.hits) ? payload.hits : [];
    let selected = null;
    for (const hit of hits) {
      if (tagsProibidas(hit.tags) || !hit.id || usedIds.has(String(hit.id)) || rejectedFor(rejectedRecord, hit.id, "")) continue;
      const source = await downloadImage(hit.largeImageURL);
      if (!source) continue;
      const finalImage = await redimensionar(source);
      const digest = sha256(finalImage);
      if (usedHashes.has(digest) || rejectedFor(rejectedRecord, hit.id, digest)) continue;
      selected = { hit, source, finalImage, digest };
      break;
    }
    if (!selected) throw new Error(`Nenhuma foto elegível encontrada para ${item.patrimonio} (${item.busca}).`);

    await mkdir(BUILD_DIR, { recursive: true });
    await writeFile(output, selected.finalImage);
    if (!await dimensaoOk(output)) throw new Error(`A imagem final de ${item.patrimonio} não ficou em 800x600.`);
    const { hit, digest } = selected;
    const nextRecord = {
      ...rejectedRecord,
      patrimonio: item.patrimonio,
      arquivo: `imagens-build/${item.patrimonio}.jpg`,
      fonte: "Pixabay",
      pixabay_id: hit.id,
      pageURL: hit.pageURL,
      user: hit.user,
      user_id: hit.user_id,
      licenca: "Pixabay Content License",
      busca: item.busca,
      tags: hit.tags,
      sha256: digest,
      baixado_em: new Date().toISOString(),
      status: "pendente",
      motivo: options.reject === item.patrimonio ? options.reason.trim() : "",
      rejeitados: rejectedRecord.rejeitados ?? [],
    };
    byPatrimony.set(item.patrimonio, nextRecord);
    records = [...byPatrimony.values()];
    await saveCredits(records);
    usedIds.add(String(hit.id));
    usedHashes.add(digest);
    console.log(`Preparada ${item.patrimonio} (status: pendente).`);
  }

  records = items.map((item) => byPatrimony.get(item.patrimonio) ?? initialRecord(item));
  await saveCredits(records);
  await makeReview(items, records);
  console.log("Revisão gerada em imagens-build/revisao.html.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  run().catch((error) => {
    logError(error);
    process.exitCode = 1;
  });
}



