import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { dimensaoOk, hostPermitido, redigir, redimensionar, sha256, tagsProibidas } from "./lib.mjs";
import { validarArquivos, validarCreditos } from "./publicar.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PUBLISH_SCRIPT = path.join(SCRIPT_DIR, "publicar.mjs");
const temp = await mkdtemp(path.join(os.tmpdir(), "empresti-imagens-test-"));
const makeCreditRows = (items) => items.map((item, index) => ({
  patrimonio: `TI-${String(index + 1).padStart(4, "0")}`,
  arquivo: item.file,
  pixabay_id: 1000 + index,
  sha256: item.hash,
  status: "aprovada",
  revisor: "Revisão de teste",
  revisado_em: "2026-01-01T00:00:00.000Z",
}));

const tests = [
  ["test_fonte_host_pixabay_permitido", () => assert.equal(hostPermitido("https://cdn.pixabay.com/photo/a.jpg"), true)],
  ["test_fonte_outro_dominio_recusado", () => assert.equal(hostPermitido("https://example.com/image.jpg"), false)],
  ["test_fonte_http_recusado", () => assert.equal(hostPermitido("http://pixabay.com/image.jpg"), false)],
  ["test_direito_de_imagem_tags_pessoa_reprovadas", () => {
    for (const tag of ["person", "people", "man", "woman", "men", "women", "girl", "boy", "child", "kid", "baby", "face", "portrait", "hand", "hands", "finger", "human", "student", "team", "crowd", "selfie", "businessman"]) assert.equal(tagsProibidas(tag), true, tag);
    assert.equal(tagsProibidas("laptop, office, equipment"), false);
  }],
  ["test_mesmo_tamanho_redimensionar_800x600", async () => {
    const input = await sharp({ create: { width: 320, height: 240, channels: 3, background: "#5b7fe0" } }).png().toBuffer();
    const result = await redimensionar(input);
    const metadata = await sharp(result).metadata();
    assert.equal(metadata.width, 800);
    assert.equal(metadata.height, 600);
    assert.equal(metadata.format, "jpeg");
  }],
  ["test_mesmo_tamanho_dimensao_ok_arquivo_final", async () => {
    const image = await sharp({ create: { width: 800, height: 600, channels: 3, background: "#001449" } }).jpeg().toBuffer();
    const file = path.join(temp, "final.jpg");
    await writeFile(file, image);
    assert.equal(await dimensaoOk(file), true);
  }],
  ["test_mesmo_tamanho_reprova_640x480", async () => {
    const image = await sharp({ create: { width: 640, height: 480, channels: 3, background: "#001449" } }).jpeg().toBuffer();
    const file = path.join(temp, "wrong-size.jpg");
    await writeFile(file, image);
    assert.equal(await dimensaoOk(file), false);
  }],
  ["test_sem_repeticao_hash_duplicado", () => {
    const a = Buffer.from("mesma imagem");
    const b = Buffer.from("mesma imagem");
    const used = new Set([sha256(a)]);
    assert.equal(used.has(sha256(b)), true);
    assert.equal(used.has(sha256(Buffer.from("outra imagem"))), false);
  }],
  ["test_segredos_redigir_chave", () => {
    const original = process.env.PIXABAY_API_KEY;
    process.env.PIXABAY_API_KEY = "chave-teste-ficticia";
    try {
      assert.equal(redigir("falha chave-teste-ficticia"), "falha ***");
      assert.equal(redigir("https://pixabay.com/api/?key=abc123&q=laptop"), "https://pixabay.com/api/?key=***&q=laptop");
    } finally {
      if (original === undefined) delete process.env.PIXABAY_API_KEY;
      else process.env.PIXABAY_API_KEY = original;
    }
  }],
  ["test_producao_recusa_sem_tty", () => {
    const result = spawnSync(process.execPath, [PUBLISH_SCRIPT], {
      encoding: "utf8",
      env: { ...process.env, SUPABASE_URL: "https://example.invalid", SUPABASE_SERVICE_ROLE_KEY: "segredo-ficticio-nao-exibir" },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /terminal interativo \(TTY\)/);
    assert.doesNotMatch(result.stdout + result.stderr, /segredo-ficticio-nao-exibir|example\.invalid/);
  }],
  ["test_producao_exige_aprovacao_revisor_e_data", () => {
    const records = Array.from({ length: 12 }, (_, index) => ({
      patrimonio: `TI-${String(index + 1).padStart(4, "0")}`,
      status: "aprovada",
      revisor: "Revisora",
      revisado_em: "2026-01-01T00:00:00.000Z",
    }));
    assert.doesNotThrow(() => validarCreditos(records));
    records[3].status = "pendente";
    assert.throws(() => validarCreditos(records), /status precisa ser aprovada/);
    records[3].status = "aprovada";
    records[3].revisor = "";
    assert.throws(() => validarCreditos(records), /revisor não preenchido/);
    records[3].revisor = "Revisora";
    records[3].revisado_em = "";
    assert.throws(() => validarCreditos(records), /data de revisão não preenchida/);
    assert.throws(() => validarCreditos(records.slice(0, 11)), /exatamente os 12/);
    records[3].revisor = "Revisora";
    records[3].revisado_em = "2026-01-01T00:00:00.000Z";
    const repeatedPatrimonio = [...records];
    repeatedPatrimonio[4] = { ...repeatedPatrimonio[4], patrimonio: repeatedPatrimonio[3].patrimonio };
    assert.throws(() => validarCreditos(repeatedPatrimonio), /patrimonio ausente ou repetido/);
  }],
  ["test_producao_confere_dimensao_hash_e_unicidade", async () => {
    const directory = path.join(temp, "publish-valid");
    const files = [];
    for (let index = 0; index < 2; index += 1) {
      const buffer = await sharp({ create: { width: 800, height: 600, channels: 3, background: index === 0 ? { r: 15, g: 35, b: 90 } : { r: 220, g: 150, b: 25 } } }).jpeg().toBuffer();
      const file = `TI-${String(index + 1).padStart(4, "0")}.jpg`;
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, file), buffer);
      files.push({ file, hash: sha256(buffer), buffer });
    }
    const records = makeCreditRows(files);
    assert.equal((await validarArquivos(records, directory)).length, 2);
    await assert.rejects(validarArquivos([{ ...records[0], sha256: "0".repeat(64) }], directory), /SHA-256 do arquivo não confere/);
    await assert.rejects(validarArquivos([{ ...records[0], arquivo: "ausente.jpg" }], directory), /arquivo não encontrado/);
    await assert.rejects(validarArquivos([records[0], { ...records[1], pixabay_id: records[0].pixabay_id }], directory), /pixabay_id repetido/);
    await assert.rejects(validarArquivos([records[0], { ...records[1], sha256: records[0].sha256 }], directory), /SHA-256 repetido/);
    const wrong = await sharp({ create: { width: 640, height: 480, channels: 3, background: "#001449" } }).jpeg().toBuffer();
    await writeFile(path.join(directory, "wrong.jpg"), wrong);
    await assert.rejects(validarArquivos([{ ...records[0], arquivo: "wrong.jpg", sha256: sha256(wrong) }], directory), /não tem dimensão 800x600/);
  }],
];

let failed = 0;
try {
  for (const [name, test] of tests) {
    try {
      await test();
      console.log(`PASS ${name}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL ${name}: ${error.message}`);
    }
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
if (failed) process.exitCode = 1;
else console.log(`Todos os ${tests.length} testes passaram sem rede.`);




