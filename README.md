# Ondelle Aesthetics

Site de demonstração de uma clínica de medicina estética premium, para o
mercado dos EUA. Serve de peça de portefólio numa campanha de contacto a med
spas americanas: mostra-se o link, vende-se o projeto à medida.

**A marca é fictícia.** A clínica, a direção clínica, a morada e o telefone não
existem, e o site diz isso no rodapé. O telefone usa a gama `555-01xx`,
reservada para ficção na América do Norte, portanto não toca em casa de
ninguém. A morada é um bairro (Miami Design District) e não um número de porta,
para não instalar um negócio inventado na morada de alguém.

Fica **fora dos motores de busca** por omissão (`robots: noindex`). É de
propósito: com dados estruturados a descrever um negócio em Miami, indexado
apareceria em pesquisa a parecer uma clínica verdadeira. Visita-se porque
alguém mandou o link.

## Origem

Fork do site construído para uma clínica real em Portugal, que não fechou.
Foram removidos: nome, morada, telefone, email, Instagram, números de registo
na autoridade de saúde, direção clínica, e **22 fotografias e vídeos** da
clínica, da equipa e do espaço. As 11 imagens em `public/imagens/protocolos/`
ficaram por serem geradas por IA.

O código é o mesmo; a marca não tem nada em comum.

## Como mexer

Todo o texto vive em **`src/lib/content.ts`**. Trocar a marca inteira é
reescrever esse ficheiro — não é preciso abrir um componente. É essa a
propriedade que torna isto vendável: o mesmo site serve outro nicho num dia.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npx tsc --noEmit # verificação de tipos
```

## Estado

- `tsc --noEmit` limpo, `next build` passa, 0 imagens partidas, 0 overflow
  horizontal, 0 palavras em português no texto visível.
- Declaração de marca fictícia no rodapé a **9,98:1** de contraste (passa
  WCAG AA).
- **19 lugares de imagem por preencher** — ver [IMAGENS-A-GERAR.md](IMAGENS-A-GERAR.md).
  É o que falta para isto deixar de parecer uma maqueta e passar a parecer uma
  clínica.

## O que este site deliberadamente não tem

- **Antes/depois.** Nos EUA é publicidade regulada em medicina estética. Um
  antes/depois inventado seria o único conteúdo aqui capaz de dar problema a
  sério. Se um comprador quiser a secção, entrega-se o *layout* com a nota de
  que as fotografias têm de ser dele e com consentimento escrito.
- **Formulário que envia.** O bloco de marcação percorre-se todo e mostra a
  confirmação, mas nada sai do browser. Um formulário que fingisse contactar
  uma clínica inexistente seria a única coisa desonesta na página.
- **Promessas de resultado.** A copy descreve procedimentos e diz que a
  elegibilidade se determina em consulta. É assim que a publicidade de saúde
  se escreve, e mostra ao comprador que percebes do assunto dele.

## Próximo nicho

A estrutura repete-se: `content.ts` novo, imagens novas, marca nova. Os
candidatos por ordem de facilidade são clínica dentária, salão de cabeleireiro
e imobiliária — todos com a mesma gramática de secções (serviços, equipa,
espaço, marcação).
