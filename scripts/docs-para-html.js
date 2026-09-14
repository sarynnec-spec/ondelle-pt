/**
 * Converte DOCUMENTATION.md num HTML autónomo para a submissão à Envato,
 * que exige a documentação em PDF ou HTML.
 *
 *   node scripts/docs-para-html.js
 *
 * Escreve ../ondelle-preview/documentation/index.html. Sem dependências: o
 * projecto não tem `marked` nem `pandoc`, e não vale a pena instalar um
 * parser completo para um documento que controlamos de ponta a ponta.
 */

const fs = require("fs");
const path = require("path");

const ENTRADA = path.resolve(__dirname, "..", "DOCUMENTATION.md");
const PASTA = path.resolve(__dirname, "..", "..", "ondelle-preview", "documentation");

const escapar = (t) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Marcações dentro de uma linha: código, negrito, itálico, ligações. */
function inline(t) {
  return escapar(t)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function converter(md) {
  // Normalizar CRLF -> LF. Com o \r no fim de cada linha, o `.` do JavaScript
  // (que nao corresponde a terminadores de linha) faz falhar `(.*)$` em todos
  // os titulos, e o ciclo dos paragrafos deixa de avancar: ciclo infinito.
  const linhas = md.replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let i = 0;

  while (i < linhas.length) {
    const l = linhas[i];

    // Bloco de código
    if (l.startsWith("```")) {
      const corpo = [];
      i++;
      while (i < linhas.length && !linhas[i].startsWith("```")) corpo.push(linhas[i++]);
      i++;
      out.push(`<pre><code>${escapar(corpo.join("\n"))}</code></pre>`);
      continue;
    }

    // Tabela: linha com | seguida de linha de separadores
    if (l.includes("|") && /^\s*\|[\s:|-]+\|\s*$/.test(linhas[i + 1] || "")) {
      const cel = (r) => r.split("|").slice(1, -1).map((c) => c.trim());
      const cab = cel(l);
      i += 2;
      const corpo = [];
      while (i < linhas.length && linhas[i].includes("|")) corpo.push(cel(linhas[i++]));
      out.push(
        "<table><thead><tr>" +
          cab.map((c) => `<th>${inline(c)}</th>`).join("") +
          "</tr></thead><tbody>" +
          corpo.map((r) => "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>").join("") +
          "</tbody></table>"
      );
      continue;
    }

    // Títulos
    const t = l.match(/^(#{1,4})\s+(.*)$/);
    if (t) { const n = t[1].length; out.push(`<h${n}>${inline(t[2])}</h${n}>`); i++; continue; }

    // Citação
    if (l.startsWith("> ")) {
      const corpo = [];
      while (i < linhas.length && linhas[i].startsWith("> ")) corpo.push(linhas[i++].slice(2));
      out.push(`<blockquote><p>${inline(corpo.join(" "))}</p></blockquote>`);
      continue;
    }

    // Listas
    if (/^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l)) {
      const ordenada = /^\s*\d+\.\s+/.test(l);
      const itens = [];
      while (i < linhas.length && (/^\s*[-*]\s+/.test(linhas[i]) || /^\s*\d+\.\s+/.test(linhas[i]) || /^\s{2,}\S/.test(linhas[i]))) {
        if (/^\s{2,}\S/.test(linhas[i]) && itens.length) itens[itens.length - 1] += " " + linhas[i].trim();
        else itens.push(linhas[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, ""));
        i++;
      }
      const tag = ordenada ? "ol" : "ul";
      out.push(`<${tag}>` + itens.map((x) => `<li>${inline(x)}</li>`).join("") + `</${tag}>`);
      continue;
    }

    if (l.trim() === "---") { out.push("<hr>"); i++; continue; }
    if (l.trim() === "") { i++; continue; }

    // Parágrafo
    const par = [];
    while (i < linhas.length && linhas[i].trim() !== "" && !/^(#{1,4}\s|```|>\s|\s*[-*]\s|\s*\d+\.\s)/.test(linhas[i]) && linhas[i].trim() !== "---") {
      par.push(linhas[i++]);
    }
    if (par.length) out.push(`<p>${inline(par.join(" "))}</p>`);
  }
  return out.join("\n");
}

const md = fs.readFileSync(ENTRADA, "utf8");
const titulo = (md.match(/^#\s+(.*)$/m) || [, "Documentation"])[1];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(titulo)}</title>
<style>
  :root { --tinta:#241016; --suave:#6b5560; --linha:#e6dde0; --fundo:#fffdfc; --caixa:#f7f2f3; --realce:#3b0112; }
  * { box-sizing:border-box; }
  body { margin:0; padding:3rem 1.5rem 6rem; font:16px/1.65 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
         color:var(--tinta); background:var(--fundo); }
  main { max-width:52rem; margin:0 auto; }
  h1 { font-size:2.1rem; line-height:1.2; margin:0 0 .5rem; letter-spacing:-.02em; }
  h2 { font-size:1.4rem; margin:3rem 0 .75rem; padding-bottom:.4rem; border-bottom:2px solid var(--linha); }
  h3 { font-size:1.1rem; margin:2rem 0 .5rem; }
  h4 { font-size:1rem; margin:1.5rem 0 .4rem; color:var(--suave); }
  p, li { color:var(--tinta); }
  a { color:var(--realce); }
  code { background:var(--caixa); padding:.15em .4em; border-radius:4px; font-size:.9em;
         font-family:ui-monospace,SFMono-Regular,Consolas,monospace; }
  pre { background:var(--caixa); border:1px solid var(--linha); border-radius:8px; padding:1rem;
        overflow-x:auto; }
  pre code { background:none; padding:0; font-size:.86rem; line-height:1.5; }
  table { border-collapse:collapse; width:100%; margin:1.25rem 0; display:block; overflow-x:auto; }
  th, td { border:1px solid var(--linha); padding:.55rem .8rem; text-align:left; vertical-align:top; font-size:.94rem; }
  th { background:var(--caixa); font-weight:600; }
  blockquote { margin:1.25rem 0; padding:.75rem 1rem; border-left:3px solid var(--realce);
               background:var(--caixa); border-radius:0 6px 6px 0; }
  blockquote p { margin:0; }
  hr { border:0; border-top:1px solid var(--linha); margin:2.5rem 0; }
  ul, ol { padding-left:1.4rem; }
  li { margin:.3rem 0; }
  @media (prefers-color-scheme: dark) {
    :root { --tinta:#f0e8ea; --suave:#b09aa2; --linha:#3a2b31; --fundo:#170a0e; --caixa:#221317; --realce:#e0b878; }
  }
</style>
</head>
<body>
<main>
${converter(md)}
</main>
</body>
</html>
`;

fs.mkdirSync(PASTA, { recursive: true });
const destino = path.join(PASTA, "index.html");
fs.writeFileSync(destino, html, "utf8");
console.log(`Escrito: ${destino}`);
console.log(`${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
