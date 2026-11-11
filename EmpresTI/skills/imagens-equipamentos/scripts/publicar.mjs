import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { dimensaoOk, sha256 } from "./lib.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "../../..");
const CREDITS_PATH = path.join(ROOT, "data/imagens/creditos.json");

export function validarCreditos(records) {
  if (!Array.isArray(records) || records.length !== 12) {
    throw new Error("creditos.json deve conter exatamente os 12 equipamentos.");
  }
  const patrimonios = new Set();
  for (const record of records) {
    if (typeof record.patrimonio !== "string" || !record.patrimonio.trim() || patrimonios.has(record.patrimonio)) {
      throw new Error("patrimonio ausente ou repetido em creditos.json.");
    }
    patrimonios.add(record.patrimonio);
    if (record.status !== "aprovada") {
      throw new Error(`${record.patrimonio ?? "Item sem patrimônio"}: status precisa ser aprovada.`);
    }
    if (typeof record.revisor !== "string" || !record.revisor.trim()) {
      throw new Error(`${record.patrimonio}: revisor não preenchido.`);
    }
    if (typeof record.revisado_em !== "string" || !record.revisado_em.trim()) {
      throw new Error(`${record.patrimonio}: data de revisão não preenchida.`);
    }
  }
}

export async function validarArquivos(records, root = ROOT) {
  const usedIds = new Set();
  const usedHashes = new Set();
  const files = [];

  for (const record of records) {
    if (record.pixabay_id === null || record.pixabay_id === undefined || record.pixabay_id === "") {
      throw new Error(`${record.patrimonio}: pixabay_id ausente.`);
    }
    const id = String(record.pixabay_id);
    if (usedIds.has(id)) throw new Error(`${record.patrimonio}: pixabay_id repetido (${id}).`);
    usedIds.add(id);

    if (typeof record.sha256 !== "string" || !/^[a-f\d]{64}$/i.test(record.sha256)) {
      throw new Error(`${record.patrimonio}: SHA-256 ausente ou inválido.`);
    }
    const expectedHash = record.sha256.toLowerCase();
    if (usedHashes.has(expectedHash)) throw new Error(`${record.patrimonio}: SHA-256 repetido.`);
    usedHashes.add(expectedHash);

    if (typeof record.arquivo !== "string" || !record.arquivo) {
      throw new Error(`${record.patrimonio}: caminho do arquivo ausente.`);
    }
    const imagePath = path.resolve(root, record.arquivo);
    const relativePath = path.relative(root, imagePath);
    if (!relativePath || relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new Error(`${record.patrimonio}: caminho de arquivo fora da pasta do projeto.`);
    }
    if (!existsSync(imagePath)) throw new Error(`${record.patrimonio}: arquivo não encontrado (${record.arquivo}).`);
    if (!await dimensaoOk(imagePath)) throw new Error(`${record.patrimonio}: imagem final não tem dimensão 800x600.`);
    const bytes = await readFile(imagePath);
    const actualHash = sha256(bytes);
    if (actualHash !== expectedHash) throw new Error(`${record.patrimonio}: SHA-256 do arquivo não confere com o registro.`);
    files.push({ record, imagePath, bytes });
  }
  return files;
}

async function verificarBucket(supabaseUrl, serviceKey) {
  const baseUrl = supabaseUrl.replace(/\/+$/, "");
  let response;
  try {
    response = await fetch(`${baseUrl}/storage/v1/bucket/equipamentos`, {
      method: "GET",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
  } catch {
    throw new Error("Falha ao verificar o bucket no Supabase; URL e credenciais foram omitidas.");
  }
  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404 || (response.status === 400 && /bucket.*not found/i.test(body))) {
      throw new Error("O bucket 'equipamentos' não existe. Ele deve ser criado por migration ou decisão registrada; este script não cria buckets.");
    }
    throw new Error(`Não foi possível verificar o bucket 'equipamentos' (HTTP ${response.status}).`);
  }
  let bucket;
  try { bucket = await response.json(); }
  catch { throw new Error("A resposta do Supabase para o bucket não é JSON válido."); }
  if (bucket.public !== true) throw new Error("O bucket 'equipamentos' existe, mas não está público.");
}

async function solicitarConfirmacao(files) {
  console.log("Arquivos que serão enviados:");
  for (const { record } of files) console.log(`- ${record.patrimonio}: ${record.arquivo}`);
  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    const answer = await prompt.question('Digite PUBLICAR para confirmar: ');
    return answer === "PUBLICAR";
  } finally {
    prompt.close();
  }
}

async function publicar() {
  // Guarda intencionalmente antes de ler ambiente, arquivos ou fazer requests.
  if (!stdin.isTTY) throw new Error("Publicação recusada: execute manualmente em um terminal interativo (TTY).");

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidos no ambiente do terminal.");
  }

  let records;
  try { records = JSON.parse(await readFile(CREDITS_PATH, "utf8")); }
  catch { throw new Error("Não foi possível ler data/imagens/creditos.json."); }
  validarCreditos(records);
  const files = await validarArquivos(records);
  await verificarBucket(supabaseUrl, serviceKey);

  if (!await solicitarConfirmacao(files)) {
    console.log("Publicação cancelada; nenhum arquivo foi enviado.");
    return;
  }

  const baseUrl = supabaseUrl.replace(/\/+$/, "");
  for (const { record, bytes } of files) {
    const objectPath = `${baseUrl}/storage/v1/object/equipamentos/${encodeURIComponent(record.patrimonio)}.jpg`;
    let response;
    try {
      response = await fetch(objectPath, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "content-type": "image/jpeg",
          "x-upsert": "true",
        },
        body: bytes,
      });
    } catch {
      throw new Error(`Falha de rede ao enviar ${record.patrimonio}; URL e credenciais foram omitidas. Os envios anteriores podem já ter sido concluídos.`);
    }
    if (!response.ok) {
      throw new Error(`Falha ao enviar ${record.patrimonio} (HTTP ${response.status}); os envios anteriores podem já ter sido concluídos.`);
    }
  }

  for (const record of records) {
    record.url_publica = `${baseUrl}/storage/v1/object/public/equipamentos/${encodeURIComponent(record.patrimonio)}.jpg`;
  }
  await writeFile(CREDITS_PATH, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  console.log("Publicação concluída; URLs públicas registradas em data/imagens/creditos.json.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  publicar().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

