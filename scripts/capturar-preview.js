/**
 * Captura o material de preview para a listagem de venda.
 *
 *   node scripts/capturar-preview.js [url]
 *
 * Produz, em ../ondelle-preview/ :
 *   capa.png            1180x664, a imagem de capa da listagem
 *   desktop-NN-*.png    uma por secção, 1600x1000
 *   mobile-NN-*.png     as principais em 390x844
 *   scroll.webm         gravação a descer a página inteira
 *
 * A gravação é feita com scroll suave e pausas, para o Lenis e o GSAP
 * dispararem as animações — um scroll instantâneo salta-as todas e o vídeo
 * sai parado, que é o oposto do que queremos mostrar.
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

// Ignorar as flags (--sem-video) ao procurar o URL.
const ARGS = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const URL_BASE = ARGS[0] || "https://ondelle-aesthetics.vercel.app";
const SAIDA = path.resolve(__dirname, "..", "..", "ondelle-preview");

// Secções a capturar, na ordem da página. O id vem de `sectionIds`
// em src/lib/content.ts.
const SECCOES = [
  "inicio", "introducao", "filosofia", "direcao-clinica",
  "medicina-estetica", "tecnologia", "rosto", "corpo", "pele",
  "rituais", "experiencia", "protocolos", "resultados",
  "marcar", "contactos",
];

const SECCOES_MOBILE = ["inicio", "rosto", "protocolos", "marcar"];

/**
 * O cursor personalizado desenha-se na ultima posicao do rato, que numa
 * captura automatica e o canto superior esquerdo. Fica um ponto solto no
 * canto de todas as imagens. Escondemo-lo so para a captura.
 */
const ESCONDER_CURSOR = `
  [class*="cursor"], [data-cursor], .cursor { opacity: 0 !important; }
  * { caret-color: transparent !important; }
`;

/**
 * Espera que a seccao pare de mudar. O GSAP revela com fade e transform;
 * capturar a meio da revelacao da uma imagem com o texto a 40% de opacidade.
 * Comparamos o retrato da seccao de 400 em 400ms ate duas leituras seguidas
 * darem igual.
 */
async function esperarEstabilizar(page, seletor, maxMs = 9000) {
  const inicio = Date.now();
  let anterior = null;
  while (Date.now() - inicio < maxMs) {
    const agora = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const alvos = [el, ...el.querySelectorAll("h1,h2,h3,p,img,figure,li")].slice(0, 40);
      return alvos.map((n) => {
        const e = getComputedStyle(n);
        return e.opacity + "|" + e.transform;
      }).join(";");
    }, seletor);
    if (agora !== null && agora === anterior) return true;
    anterior = agora;
    await dormir(400);
  }
  return false;
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Enquadra a seccao pelo TOPO, sempre.
 *
 * O `scrollIntoViewIfNeeded` mostra "o maximo possivel" do elemento: numa
 * seccao mais alta do que o ecra, alinha pelo fundo e corta o titulo ao meio.
 * Aqui pomos o inicio da seccao no topo da janela, com uma folga pequena, para
 * todas as capturas terem o mesmo enquadramento.
 */
async function enquadrarPeloTopo(page, seletor, folga = 8) {
  await page.evaluate(({ sel, folga }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - folga;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, { sel: seletor, folga });
}

/** Desce a página em passos pequenos, deixando as animações correr. */
async function descerDevagar(page, passos = 60, pausa = 260) {
  const altura = await page.evaluate(() => document.body.scrollHeight);
  for (let i = 1; i <= passos; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }),
      (altura / passos) * i);
    await dormir(pausa);
  }
  await dormir(1500);
}

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  console.log(`A capturar ${URL_BASE}`);
  console.log(`Destino: ${SAIDA}\n`);

  const browser = await chromium.launch();

  // ── 1. Vídeo do scroll ────────────────────────────────────────────────
  const SALTAR_VIDEO = process.argv.includes("--sem-video");
  let ctx = null;
  let page = null;

  if (SALTAR_VIDEO) {
    console.log("1/4  Video — SALTADO (--sem-video)");
  } else {
    console.log("1/4  Video do scroll (demora ~1 min)...");
    ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: SAIDA, size: { width: 1440, height: 900 } },
      deviceScaleFactor: 1,
    });
    page = await ctx.newPage();
    await page.goto(URL_BASE, { waitUntil: "networkidle", timeout: 90000 });
    await dormir(4000); // deixar o preloader terminar
    await descerDevagar(page);
    const video = page.video();
    await ctx.close();
    if (video) {
      const destino = path.join(SAIDA, "scroll.webm");
      if (fs.existsSync(destino)) fs.unlinkSync(destino);
      fs.renameSync(await video.path(), destino);
      console.log("     scroll.webm");
    }
  }

  // ── 2. Screenshots de desktop, secção a secção ────────────────────────
  console.log("2/4  Screenshots de desktop...");
  ctx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
  });
  page = await ctx.newPage();
  await page.goto(URL_BASE, { waitUntil: "networkidle", timeout: 90000 });
  await page.addStyleTag({ content: ESCONDER_CURSOR });
  await dormir(4000);
  await descerDevagar(page, 40, 120); // acorda as animações uma vez
  await page.evaluate(() => window.scrollTo(0, 0));
  await dormir(2000);

  let n = 0;
  for (const id of SECCOES) {
    const alvo = page.locator(`#${id}`).first();
    if (!(await alvo.count())) { console.log(`     (sem #${id})`); continue; }
    await enquadrarPeloTopo(page, `#${id}`);
    await dormir(1400);
    const estavel = await esperarEstabilizar(page, `#${id}`);
    n += 1;
    if (!estavel) console.log(`     aviso: #${id} ainda a animar ao fim de 9s`);
    const nome = `desktop-${String(n).padStart(2, "0")}-${id}.png`;
    await page.screenshot({ path: path.join(SAIDA, nome) });
    console.log(`     ${nome}`);
  }

  // ── 3. Imagem de capa ─────────────────────────────────────────────────
  console.log("\n3/4  Imagem de capa 1180x664...");
  await page.setViewportSize({ width: 1180, height: 664 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await dormir(2500);
  await page.screenshot({ path: path.join(SAIDA, "capa.png") });
  console.log("     capa.png");
  await ctx.close();

  // ── 4. Screenshots de telemóvel ───────────────────────────────────────
  console.log("\n4/4  Screenshots de telemóvel...");
  ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  page = await ctx.newPage();
  await page.goto(URL_BASE, { waitUntil: "networkidle", timeout: 90000 });
  await page.addStyleTag({ content: ESCONDER_CURSOR });
  await dormir(4000);
  await descerDevagar(page, 30, 120);
  await page.evaluate(() => window.scrollTo(0, 0));
  await dormir(2000);

  n = 0;
  for (const id of SECCOES_MOBILE) {
    const alvo = page.locator(`#${id}`).first();
    if (!(await alvo.count())) continue;
    await enquadrarPeloTopo(page, `#${id}`);
    await dormir(1400);
    await esperarEstabilizar(page, `#${id}`);
    n += 1;
    const nome = `mobile-${String(n).padStart(2, "0")}-${id}.png`;
    await page.screenshot({ path: path.join(SAIDA, nome) });
    console.log(`     ${nome}`);
  }
  await ctx.close();
  await browser.close();

  const fich = fs.readdirSync(SAIDA);
  console.log(`\nPronto: ${fich.length} ficheiros em ${SAIDA}`);
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
