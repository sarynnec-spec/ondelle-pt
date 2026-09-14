/**
 * Todo o texto do site vive neste ficheiro, para que a marca inteira possa
 * ser reescrita sem abrir um único componente.
 *
 * A ONDELLE É UMA MARCA FICTÍCIA. Foi criada como peça de portefólio — a
 * demonstração de um site de clínica de estética avançada. A clínica, a
 * direção clínica, a morada e o telefone não existem. O telefone é um número
 * a zeros, que não toca em casa de ninguém, e a morada é uma avenida sem
 * número de porta, para que nenhum negócio ou residente real fique sentado
 * nela.
 *
 * Nada aqui é herdado de um cliente real. Todos os nomes, credenciais e
 * contactos do projeto de origem foram retirados.
 *
 * Esta é a versão portuguesa do site. A versão inglesa vive em
 * https://ondelle-aesthetics.vercel.app e é a mesma casa noutra língua e
 * noutro país.
 */

/**
 * Fotografia e vídeo: `null` é um estado legítimo, não um esquecimento.
 *
 * Enquanto está a `null`, a moldura desenha um gradiente com o recorte e a
 * proporção certos. Para entrar um ficheiro real, põe-se aqui o caminho a
 * partir de `public/` — ver `IMAGENS-A-GERAR.md` na raiz para a lista de
 * planos e as dimensões exatas que cada lugar exige.
 */
type Media = string | null;

const semMedia: Media = null;

export const brand = {
  name: "ONDELLE",
  full: "Ondelle Estética Avançada",
  tagline: "Estética avançada. Naturalmente si própria.",
  city: "Lisboa",
  url: "https://ondelle-estetica.vercel.app",
  email: "ola@ondelle.pt",
  // Número a zeros, de propósito. Portugal não tem uma gama reservada para
  // ficção como o 555-01xx norte-americano, por isso a saída é um número que
  // ninguém tem. Não trocar por um número que funcione sem haver alguém do
  // outro lado para atender.
  phone: "210 000 000",
  // A menção da tarifa ao lado de um número fixo é convenção portuguesa, e
  // é ela que substitui o "Call · Text" da versão americana. Não há link de
  // WhatsApp montado, por isso não se anuncia um.
  phoneNote: "Chamada para a rede fixa nacional",
  booking: "tel:+351210000000",
  instagram: { handle: "@ondelleestetica", url: "#" },
  address: {
    // Avenida, deliberadamente sem número de porta. Um negócio fictício
    // sentado numa morada real passa a ser problema de outra pessoa.
    street: "Avenida da Liberdade",
    postal: "1250-096",
    city: "Lisboa",
    country: "PT",
  },
  hours: [
    { dias: "Segunda a sexta", horas: "9:00 — 19:00" },
    { dias: "Sábado", horas: "10:00 — 16:00" },
    { dias: "Domingo", horas: "Encerrado" },
  ],
} as const;

/** Numeração das secções — alimenta o contador fixo. */
export const sectionIds = [
  "inicio",
  "introducao",
  "filosofia",
  "direcao-clinica",
  "medicina-estetica",
  "tecnologia",
  "rosto",
  "corpo",
  "pele",
  "rituais",
  "experiencia",
  "protocolos",
  "resultados",
  "marcar",
  "contactos",
] as const;

export type SectionId = (typeof sectionIds)[number];

export const counterLabels = [
  "Início",
  "Introdução",
  "Filosofia",
  "Direção Clínica",
  "Medicina Estética",
  "Tecnologia",
  "Rosto",
  "Corpo",
  "Pele",
  "Rituais",
  "Experiência",
  "Protocolos",
  "Resultados",
  "Marcar",
  "Contactos",
];

export const nav = [
  { label: "Início", href: "#inicio" },
  { label: "A clínica", href: "#filosofia" },
  { label: "Tratamentos", href: "#medicina-estetica" },
  { label: "Tecnologia", href: "#tecnologia" },
  { label: "Experiência", href: "#experiencia" },
  { label: "Contactos", href: "#contactos" },
] as const;

export const ctaLabel = "Marcar consulta";

// ── 00 · Abertura ────────────────────────────────────────────────────────
/**
 * O logótipo que sobe dentro do portal durante a introdução.
 *
 * Vazio: o `Wordmark` desenha-o em SVG, com texto vivo. Não há ficheiro de
 * imagem — o original era o logótipo de uma clínica real e não podia viajar
 * para dentro de uma marca de demonstração.
 */
export const abertura = {
} as const;

// ── 01 · Hero ────────────────────────────────────────────────────────────
export const hero = {
  eyebrow: "Lisboa · Estética Avançada",
  title: "Estética avançada.\nResultados que continuam a ser seus.",
  lead: "Na Ondelle, o tratamento começa muito antes da primeira sessão. Começa na avaliação, em ouvir, e em perceber o seu rosto, o seu corpo e aquilo que realmente quer.",
  note: "Protocolos personalizados. Tecnologia avançada. Direção clínica médica.",
  cta: "Marcar consulta",
  // Gradiente ambiente gerado, não filmagem. É um substituto que se lê como
  // uma abertura escura de propósito e não como um ficheiro em falta, e não
  // transporta pessoas, instalações nem promessa nenhuma.
  video: "/imagens/video/ambient-hero.mp4",
  videoMobile: "/imagens/video/ambient-hero-vertical.mp4",
} as const;

// ── 02 · Introdução ──────────────────────────────────────────────────────
export const intro = {
  label: "Sobre a Ondelle",
  title: "O seu rosto não precisa de ser transformado.\nPrecisa de ser compreendido.",
  body: [
    "Na Ondelle, acreditamos numa estética que respeita a pessoa que já é.",
  ],
  close: "Porque o verdadeiro luxo não é parecer outra pessoa. É sentir-se mais si própria.",
  imagem: semMedia,
  alt: "",
} as const;

// ── 03 · Filosofia ───────────────────────────────────────────────────────
export const filosofia = {
  label: "Filosofia",
  title: "Menos excesso.\nMais precisão.",
  items: [
    { n: "01", title: "A avaliação" },
    { n: "02", title: "A técnica" },
    { n: "03", title: "A tecnologia" },
    { n: "04", title: "O protocolo" },
    { n: "05", title: "O acompanhamento" },
  ],
  body: "Cada tratamento na Ondelle é planeado individualmente, à volta da sua anatomia, das suas preocupações e do resultado que procura.",
  close: "O nosso compromisso é simples: realçar, sem apagar.",
} as const;

// ── 04 · Direção clínica ─────────────────────────────────────────────────
export const direcaoClinica = {
  label: "Direção Clínica",
  title: "Experiência clínica.\nUm olhar individual.",
  body: "A Ondelle é uma clínica com direção médica. Todos os protocolos são desenhados sob orientação clínica e executados por profissionais habilitados, com rigor técnico e uma abordagem centrada em cada pessoa.",
  purpose: "Cada decisão é tomada com um único propósito:",
  close: "respeitar a sua anatomia, honrar o que a torna distinta e procurar resultados que se leiam como naturais.",
  // Fictícia, como a clínica. Ver o aviso no topo deste ficheiro e o que é
  // desenhado no rodapé.
  person: { name: "Dr. Camille Roux", role: "Direção Clínica" },
  /**
   * A moldura roda entre estes retratos e a legenda segue o que está no
   * ecrã. O projeto de origem usava fotografias de um médico e de uma equipa
   * reais, e nada disso podia viajar para dentro de uma marca de
   * demonstração. Estas substituições foram geradas para a Ondelle — o
   * logótipo está na parede e em cada bata.
   *
   * O segundo retrato foi recortado de uma maqueta de página inteira — o
   * ficheiro tal como veio trazia barra de navegação, título e uma faixa de
   * ícones por cima da fotografia. Recortar foi a forma de honrar o que este
   * lugar exige: a mesma cara do primeiro, vista de outra maneira.
   */
  retratos: [
    {
      src: "/imagens/equipa/direcao-01.png",
      alt: "Direção clínica, Ondelle Estética Avançada",
      nome: "Dr. Camille Roux",
      papel: "Direção Clínica",
      bio: "Especialista em medicina estética, com uma prática construída sobre a contenção. O trabalho pelo qual é conhecido é o que não se consegue apontar — o resultado que se lê como descanso e não como tratamento.",
    },
    {
      // Recortado da maqueta de página que ela gerou: o ficheiro original
      // trazia barra de navegação, título e faixa de ícones por cima da
      // fotografia. Cortado em y 100..1090 de 1672, fica só o médico —
      // mesma cara do primeiro retrato, que é o que este lugar exige.
      src: "/imagens/equipa/direcao-02.png",
      alt: "Direção clínica, Ondelle Estética Avançada",
      nome: "Dr. Camille Roux",
      papel: "Direção Clínica",
    },
    {
      // A equipa SAIU daqui a pedido dela. O ficheiro é 1448x1086 — 4:3
      // deitado — e esta moldura é 4:5 de pé: entrava cortada pelos lados,
      // com as pessoas das pontas pelo meio. Foi para a moldura 4:3 da
      // Filosofia, que tem exatamente a proporção dela.
      //
      // `RetratoRotativo` filtra por `src !== null`, por isso deixá-la a
      // `semMedia` basta para sair da rotação — não fica um lugar vazio a
      // desenhar gradiente de três em três segundos.
      src: semMedia,
      alt: "A equipa Ondelle",
      nome: "A equipa Ondelle",
    },
  ],
  imagem: semMedia,
  alt: "",
} as const;

export const espaco = {
  label: "O Espaço",
  intro: "Uma clínica de medicina estética na Avenida da Liberdade, em Lisboa.",
  title: "Um espaço pensado à sua volta.",
  body: [
    "Um espaço desenhado para quem quer parecer uma versão descansada de si própria, e não outra pessoa.",
    "Vai encontrar aqui tratamentos avançados e planeados caso a caso, executados por profissionais habilitados, num ambiente calmo e contemporâneo.",
    "O nosso trabalho é ajudá-la a chegar aos seus objetivos estéticos com segurança, atenção e competência.",
  ],
  close: "Cada detalhe foi pensado para que a própria visita valha a pena, com o seu conforto em primeiro lugar.",
} as const;

// ── 05 · Medicina estética ───────────────────────────────────────────────
export const medicinaEstetica = {
  id: "medicina-estetica",
  label: "Medicina Estética",
  title: "A arte da precisão",
  intro: [
    "Um tratamento injetável exige mais do que técnica.",
    "Exige anatomia, proporção e critério.",
  ],
  cta: "Ver medicina estética",
  items: [
    {
      n: "01",
      title: "Toxina botulínica",
      body: "Protocolos personalizados para suavizar as linhas de expressão mantendo o movimento e a expressão do rosto intactos.",
      imagem: "/imagens/protocolos/protocolos-toxina-botulinica.jpg.jpg",
      alt: "Tratamento com toxina botulínica",
    },
    {
      n: "02",
      title: "Preenchimentos",
      body: "Reposição de volume e harmonização facial através de uma abordagem individual que respeita a sua anatomia.",
      imagem: "/imagens/protocolos/protocolos-preenchimentos.jpg.jpg",
      alt: "Tratamento com preenchimento dérmico",
    },
    {
      n: "03",
      title: "Tratamento da hiperidrose",
      body: "Tratamento da zona axilar para reduzir a transpiração excessiva, sempre após consulta de avaliação.",
      imagem: "/imagens/protocolos/hyperhidrosis.png",
      alt: "Sessão de tratamento axilar para transpiração excessiva",
    },
  ],
} as const;

// ── 06 · Tecnologia ──────────────────────────────────────────────────────
export const tecnologia = {
  id: "tecnologia",
  label: "Tecnologia",
  title: "Tecnologia que trabalha para a sua pele.",
  intro: [
    "A inovação só conta quando é aplicada com intenção.",
    "Na Ondelle, a tecnologia e o critério clínico encontram-se para construir protocolos à volta daquilo de que a sua pele precisa.",
  ],
  kinetic: "Tecnologia. Precisão. Personalização.",
  items: [
    {
      n: "01",
      title: "Microagulhamento com radiofrequência",
      body: "Radiofrequência fracionada aplicada em protocolos personalizados de pele, incluindo abordagens para a zona delicada do contorno dos olhos.",
      imagem: "/imagens/protocolos/protocolos-morpheus8.jpg.jpg",
      alt: "Sessão de microagulhamento com radiofrequência",
    },
    {
      n: "02",
      title: "Ultrassons focados",
      body: "Ultrassom focado de alta intensidade usado em protocolos dirigidos à firmeza e à definição.",
      imagem: "/imagens/protocolos/protocolos-hifu.jpg.jpg",
      alt: "Sessão de ultrassons focados",
    },
    {
      n: "03",
      title: "Luz pulsada intensa",
      body: "Luz pulsada intensa integrada em protocolos personalizados de rosto e corpo.",
      imagem: "/imagens/protocolos/protocolos-ipl-pele.jpg.png",
      alt: "Sessão de luz pulsada intensa",
    },
    {
      n: "04",
      title: "Laser",
      body: "Tecnologia laser aplicada em protocolos de depilação e de renovação da pele, adaptada a cada zona e a cada fototipo.",
      imagem: "/imagens/protocolos/protocolos-laser.jpg.png",
      alt: "Sessão de tratamento a laser",
    },
  ],
} as const;

// ── 07 · Rosto ───────────────────────────────────────────────────────────
export const rosto = {
  label: "Rosto",
  title: "O seu rosto.\nA sua identidade.",
  kicker: "A beleza vive no equilíbrio.",
  body: [
    "Os nossos protocolos de rosto são construídos para cuidar, melhorar e honrar — sem apagar aquilo que torna um rosto reconhecivelmente seu.",
    "Da medicina estética aos equipamentos avançados, cada tratamento é decidido pessoa a pessoa.",
  ],
  close: "Resultados naturais começam em decisões personalizadas.",
  imagem: "/imagens/destaque/rosto-principal.png",
  alt: "Um rosto em repouso, de olhos fechados, emoldurado por pétalas claras",
} as const;

// ── 08 · Corpo ───────────────────────────────────────────────────────────
export const corpo = {
  id: "corpo",
  label: "Corpo",
  title: "Cuidar do corpo é cuidar de si.",
  intro: ["Protocolos de corpo desenhados para necessidades, objetivos e fases diferentes."],
  cta: "Ver tratamentos de corpo",
  items: [
    {
      n: "01",
      title: "Drenagem linfática",
      body: "Uma abordagem de bem-estar à circulação, à recuperação e à sensação de leveza.",
      imagem: "/imagens/protocolos/protocolos-drenagem-linfatica.jpg.jpg",
      alt: "Drenagem linfática manual",
    },
    {
      n: "02",
      title: "Modelação corporal",
      body: "Protocolos não cirúrgicos focados na forma, na firmeza e na definição.",
      imagem: "/imagens/protocolos/protocolosdrenomodeladora.jpg.png",
      alt: "Tratamento de modelação corporal",
    },
    {
      n: "03",
      title: "Depilação a laser",
      body: "Tecnologia laser avançada em protocolos de depilação personalizados para diferentes zonas do corpo.",
      imagem: "/imagens/protocolos/protocolos-depilacao-laser.jpg.jpg",
      alt: "Sessão de depilação a laser",
    },
    {
      n: "04",
      title: "Emagrecimento com acompanhamento médico",
      body: "Gestão de peso com supervisão médica, construída a partir do seu histórico clínico e revista em cada etapa. A elegibilidade é determinada em consulta.",
      imagem: "/imagens/protocolos/medical-weight-loss.jpg",
      alt: "Medição corporal durante um plano de gestão de peso",
    },
    {
      n: "05",
      title: "Firmeza da pele",
      body: "Protocolos com tecnologias de energia dirigidos à flacidez cutânea, feitos em ciclos de sessões e sempre após avaliação.",
      imagem: "/imagens/protocolos/skin-tightening.jpg",
      alt: "Perfil corporal a ilustrar firmeza da pele",
    },
  ],
} as const;

// ── 09 · Pele ────────────────────────────────────────────────────────────
export const pele = {
  id: "pele",
  label: "Pele",
  title: "Pele bem cuidada não precisa de filtro.",
  intro: [
    "A pele muda. As necessidades mudam. O protocolo tem de mudar com elas.",
    "Na Ondelle, avaliamos a sua pele antes de decidir seja o que for sobre ela.",
  ],
  items: [
    {
      n: "01",
      title: "Limpeza de pele profunda",
      body: "Limpeza e renovação em profundidade para clarear, renovar e revitalizar a pele.",
      imagem: "/imagens/protocolos/protocolos-limpeza-pele-profunda.jpg.jpg",
      alt: "Limpeza de pele profunda",
    },
    {
      n: "02",
      title: "Luz pulsada intensa",
      body: "Protocolos personalizados de luz pulsada para tom, textura e manchas.",
      imagem: "/imagens/protocolos/protocolos-ipl-pele.jpg.png",
      alt: "Luz pulsada intensa aplicada na pele",
    },
    {
      n: "03",
      title: "Hidratação profunda",
      body: "Tratamento dirigido a devolver conforto, luminosidade e um aspeto saudável à pele.",
      imagem: "/imagens/protocolos/protocolos-hidratacao.jpg.jpg",
      alt: "Tratamento de hidratação facial",
    },
  ],
} as const;

// ── 10 · Rituais ─────────────────────────────────────────────────────────
export const rituais = {
  id: "rituais",
  label: "Rituais",
  title: "Os pequenos detalhes também fazem parte da experiência.",
  intro: ["A experiência Ondelle vai para além da sala de tratamento."],
  kinetic: "Beleza, dos grandes resultados aos pequenos detalhes.",
  items: [
    {
      n: "01",
      title: "Hidratação labial",
      body: "Hidratação e condicionamento dos lábios.",
      imagem: "/imagens/protocolos/lip-hydration.jpg",
      alt: "Grande plano de lábios depois de um tratamento de hidratação",
    },
    {
      n: "02",
      title: "Saúde capilar",
      body: "Protocolos de couro cabeludo e cabelo ajustados a cada caso.",
      imagem: "/imagens/protocolos/hair-restoration.jpg",
      alt: "Sessão de tratamento do couro cabeludo",
    },
    {
      n: "03",
      title: "Massagem",
      body: "Tempo para abrandar, com técnica adaptada ao que o corpo está a pedir.",
      imagem: "/imagens/protocolos/massage.png",
      alt: "Mãos a executar uma massagem corporal numa marquesa",
    },
  ],
} as const;

// ── 11 · Experiência ─────────────────────────────────────────────────────
export const experiencia = {
  label: "Experiência",
  title: "Entre. Abrande.\nDeixe-se cuidar.",
  body: ["A Ondelle foi desenhada para que cada visita seja mais do que um tratamento."],
  beats: ["Um momento para parar.", "Para ser cuidada.", "Para confiar.", "Para sair mais si própria."],
  close: "Um espaço onde a tecnologia e o cuidado encontram uma experiência genuinamente pessoal.",
  imagem: semMedia,
  alt: "",
} as const;

// ── 12 · Protocolos personalizados ───────────────────────────────────────
export const protocolos = {
  label: "Protocolos Personalizados",
  title: "Não há dois protocolos iguais.",
  beats: ["Por isso começamos por ouvir.", "Depois avaliamos.", "Só então decidimos."],
  body: "Cada protocolo Ondelle é construído à volta da sua anatomia, das suas preocupações e do resultado que procura.",
  close: "A personalização não é um detalhe. É o ponto de partida.",
  /** Descobrir -> Avaliar -> Personalizar -> Tratar -> Acompanhar */
  jornada: ["Descobrir", "Avaliar", "Personalizar", "Tratar", "Acompanhar"],
} as const;

// ── 13 · Resultados naturais ─────────────────────────────────────────────
export const resultados = {
  label: "Resultados Naturais",
  title: "A melhor versão de si.\nInconfundivelmente si própria.",
  pares: [
    { nao: "Não perseguimos um padrão.", sim: "Procuramos equilíbrio." },
    { nao: "Não estamos aqui para transformar.", sim: "Estamos aqui para realçar." },
    { nao: "Não fazemos excesso.", sim: "Fazemos precisão." },
  ],
  close: "A Ondelle é estética avançada com um olhar natural sobre a beleza.",
} as const;

// ── 14 · CTA principal ───────────────────────────────────────────────────
export const cta = {
  label: "Marcar",
  title: "Está na hora\nde cuidar de si.",
  body: "Encontre o protocolo certo para si numa consulta de avaliação personalizada.",
  primary: "Marcar consulta",
  secondary: "Ligar para a clínica",
  note: "Ondelle Estética Avançada · Lisboa",
} as const;

// ── 15 · Contactos ───────────────────────────────────────────────────────
export const contactos = {
  label: "Contactos",
  title: "Ondelle Estética Avançada",
  subtitle: "Medicina Estética Avançada",
} as const;

// ── 16 · Fecho cinematográfico ───────────────────────────────────────────
export const fecho = {
  title: "A sua beleza.\nO nosso cuidado.",
  body: "Uma experiência de estética avançada personalizada, construída à sua volta.",
  cta: "Marque a sua consulta",
  imagem: semMedia, // full-bleed · 16:9+
  alt: "",
} as const;

/** Frases curtas para a tipografia cinética entre secções. */
export const frases = [
  "A beleza vive no equilíbrio.",
  "Precisão em cada detalhe.",
  "Tecnologia. Conhecimento. Cuidado.",
  "Protocolos feitos à sua medida.",
  "Naturalmente extraordinária.",
  "A sua identidade. A nossa prioridade.",
  "Onde a ciência encontra a beleza.",
  "Menos excesso. Mais precisão.",
  "O luxo de ser cuidada.",
  "Estética avançada. Naturalmente si própria.",
] as const;

export const footer = {
  /**
   * Isto substitui os números de registo na ERS e na DGS da clínica real,
   * que saíram com tudo o resto que a identificava. É a declaração, e é de
   * propósito a linha mais visível deste rodapé.
   */
  registos: "Marca fictícia — criada como demonstração de design de websites. A Ondelle não é uma clínica real e não presta serviços médicos.",
  legal: [
    { label: "Política de Privacidade", href: "#" },
    { label: "Termos", href: "#" },
    { label: "Acessibilidade", href: "#" },
  ],
} as const;
