# Imagens a gerar

Levantado do código, não de memória. São **19 lugares**: 14 estão a `null` no
`src/lib/content.ts` (o site desenha uma moldura em gradiente) e 5 estão
ligados a molduras de espera em `public/imagens/placeholder/`.

Podes entregar por partes — cada imagem entra sozinha, não é preciso ter tudo.

## Porque é que estes lugares estão vazios

O site nasceu de um projeto para uma clínica real. Todas as fotografias eram
dela, da equipa dela e do espaço dela, e **nenhuma podia viajar para uma marca
de demonstração** — nem por licença nem por decência. Foram removidas 22
fotografias e vídeos. As 11 imagens que ficaram em `public/imagens/protocolos/`
são as geradas por IA, que não têm esse problema.

## Regras que valem para todas

- **JPG**, qualidade 82–85, abaixo de 400 KB cada.
- Nome em minúsculas, sem acentos, com hífen: `retrato-direcao-01.jpg`.
- As medidas são o **mínimo**. Maior não faz mal; menor fica desfocado em ecrã
  de dupla densidade.
- **O corte é ao centro** — deixa margem à volta do motivo.
- **Sem rostos de pessoas reais.** Todas geradas, ou de banco com licença que
  cubra revenda. Este site vai ser mostrado a desconhecidos como amostra do teu
  trabalho: qualquer imagem de proveniência duvidosa passa a ser um problema
  teu no momento em que alguém a reconhece.
- **Nada de antes/depois.** Nos EUA, fotografia de antes/depois em medicina
  estética é publicidade regulada. Um antes/depois inventado num site que
  parece uma clínica é o único conteúdo aqui que poderia dar chatice a sério.

## Direção de arte

Bordô muito fechado (`#3B0112`) com ouro (`#CE9A44`). Luz suave e lateral,
pele com textura real, nada de plástico. Enquadramentos calmos, muito espaço
negativo, sem sorrisos de catálogo. A referência é editorial de moda, não
brochura de clínica.

Prefixo sugerido para os prompts:

> editorial photography, deep burgundy and warm gold palette, soft directional
> light, natural skin texture, calm composition, generous negative space,
> shot on medium format, no text, no watermark

---

## 1 · Direção clínica — 3 retratos · 4:5 · **1400 × 1750**

Onde: `direcaoClinica.retratos[].src`. A moldura roda entre os três de 3,2 em
3,2 segundos e a legenda acompanha.

| Ficheiro | Prompt |
|---|---|
| `equipa/retrato-direcao-01.jpg` | mulher de 40 e poucos anos, bata clínica branca sobre roupa escura, olhar direto e sereno, fundo bordô esbatido |
| `equipa/retrato-direcao-02.jpg` | a mesma pessoa, três quartos, a olhar fora de câmara, mãos em repouso |
| `equipa/retrato-equipa.jpg` | três profissionais em bata, agrupados sem pose rígida, mesmo fundo |

> **Importante:** a personagem chama-se Dr. Camille Roux e **não existe**. Se
> gerares, gera a mesma cara nos dois primeiros — caras diferentes com o mesmo
> nome é o tipo de descuido que estraga a credibilidade toda.

## 2 · Grandes, a ocupar o ecrã · 16:9 · **2560 × 1440**

| Ficheiro | Lugar no código | Prompt |
|---|---|---|
| `destaque/rosto-principal.jpg` | `rosto.imagem` | rosto feminino em repouso, olhos fechados, luz de janela, muito espaço à volta |
| `destaque/fecho.jpg` | `fecho.imagem` | interior de clínica ao fim do dia, vazio, uma luz acesa |
| `destaque/experiencia.jpg` | `experiencia.imagem` | sala de tratamento vista de longe, calma, sem pessoas |
| `destaque/intro.jpg` | `intro.imagem` | detalhe de mãos em repouso sobre tecido escuro |

## 3 · Cartões de tratamento · 4:5 · **1200 × 1500**

Entram em `medicinaEstetica.items[]`, `corpo.items[]` e `rituais.items[]`.

| Ficheiro | Serviço |
|---|---|
| `protocolos/hiperidrose.jpg` | Hyperhidrosis Treatment |
| `protocolos/medical-weight-loss.jpg` | Medical Weight Loss — consulta, não balança |
| `protocolos/skin-tightening.jpg` | Skin Tightening |
| `protocolos/lip-hydration.jpg` | Lip Hydration |
| `protocolos/hair-restoration.jpg` | Hair Restoration |
| `protocolos/massage.jpg` | Massage |

Prompt-base: `close-up of a calm aesthetic treatment in progress, gloved hands,
shallow depth of field` — e o serviço no fim. Sem mostrar agulhas em pele: em
anúncio de med spa nos EUA isso é assunto sensível e não acrescenta nada.

## 4 · Direção clínica e espaço · 1:1 · **1400 × 1400**

| Ficheiro | Lugar |
|---|---|
| `equipa/espaco-01.jpg` | `direcaoClinica.imagem` |

## 5 · Molduras de espera já ligadas — trocar o ficheiro

Estas cinco **já mostram alguma coisa** (gradiente na cor da casa). O site não
parte se as deixares; só fica mais pobre. Para trocar, substitui o ficheiro
mantendo o nome, ou muda o caminho no componente indicado.

| Ficheiro atual | Medida | Componente | O que devia ser |
|---|---|---|---|
| `placeholder/retrato-4x5.jpg` | 1122 × 1402 | `motion/preloader.tsx` | a fotografia que enche o portal na abertura |
| `placeholder/lamina-4x3.jpg` | 1400 × 1050 | `app/page.tsx` (2 lugares) | chaise / detalhe de mobiliário do espaço |
| `placeholder/faixa-larga.jpg` | 2203 × 714 | `app/page.tsx` | imagem muito deitada, rodada 95° na secção Experience |
| `placeholder/hero-figura.jpg` | 1200 × 1600 | `sections/hero.tsx` | figura recortada com **fundo transparente** (PNG, não JPG) |
| `video/ambient-hero.mp4` | 1920 × 1080 | `content.ts::hero.video` | vídeo de 6–10 s do espaço, sem áudio |

O vertical (`ambient-hero-vertical.mp4`, 1080 × 1920) é o mesmo plano para
telemóvel. Se trocares um, troca os dois — senão quem abrir no telemóvel vê
outra coisa.

## 6 · Wordmark

`marca/ondelle-wordmark.png` (1330 × 356, fundo transparente) foi gerado com
tipo de sistema. Serve, mas é o sítio onde mais se nota que não passou por um
designer. Se refizeres, mantém **2% de vazio de cada lado**: as margens
negativas espalhadas pelo CSS estão calibradas a essa fração, e um ficheiro com
outro vazio desalinha o cabeçalho, os contactos e o rodapé de uma vez.

O favicon (`src/app/icon.png`) é um monograma "O" separado, porque o wordmark
inteiro a 32px seria uma mancha.
