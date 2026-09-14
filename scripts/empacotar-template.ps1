# Empacota o template para venda.
#
# NAO usar `git archive HEAD` neste projecto. A maior parte do trabalho recente
# esta por commitar, e o `ambient.mp4` (video de clinica real, sem proveniencia)
# ainda existe no HEAD — um `git archive` traria-o de volta para dentro do zip.
# Este script trabalha a partir da arvore de trabalho, com exclusoes explicitas.

$ErrorActionPreference = "Stop"
$raiz    = Split-Path -Parent $PSScriptRoot
$destino = Join-Path (Split-Path -Parent $raiz) "ondelle-template.zip"
$stage   = Join-Path $env:TEMP ("ondelle-stage-" + [guid]::NewGuid().ToString("N").Substring(0,8))

# Tudo o que nunca pode entrar no pacote do comprador.
$excluir = @(
  "node_modules", ".next", ".git", ".vercel",
  ".vercel-ERRADO-aponta-sofia-sales",
  "_REMOVIDO-sem-proveniencia",
  "tsconfig.tsbuildinfo", "ondelle-template.zip",
  # Documentos internos, em portugues. O README fala do fork de uma clinica
  # real e o IMAGENS-A-GERAR descreve o processo interno — nada disto vai
  # para o comprador. O README.md e substituido pelo README-TEMPLATE.md.
  "README.md", "IMAGENS-A-GERAR.md", "README-TEMPLATE.md",
  ".vercelignore", "scripts"
)

# Imagens sem proveniencia (larguras tipicas do Pinterest: 736 / 474 / 735 / 500).
# NAO sao tocadas no projecto — o site de demonstracao fica exactamente como
# esta. Sao substituidas SO DENTRO DO PACOTE pelo placeholder neutro
# equivalente, mantendo o nome do ficheiro para nao ser preciso mexer no
# content.ts. O comprador recebe um template completo e a frase "the
# demonstration imagery is AI-generated" continua verdadeira.
$substituir = @{
  "protocolos\protocolos-preenchimentos.jpg.jpg"     = "retrato-4x5.jpg"
  "protocolos\protocolos-morpheus8.jpg.jpg"          = "retrato-4x5.jpg"
  "protocolos\skin-tightening.jpg"                   = "retrato-4x5.jpg"
  "protocolos\hair-restoration.jpg"                  = "retrato-4x5.jpg"
  "protocolos\medical-weight-loss.jpg"               = "retrato-4x5.jpg"
  "protocolos\lip-hydration.jpg"                     = "retrato-4x5.jpg"
  "protocolos\protocolos-hifu.jpg.jpg"               = "retrato-4x5.jpg"
  "protocolos\protocolos-toxina-botulinica.jpg.jpg"  = "lamina-4x3.jpg"
  "destaque\abertura.jpg"                            = "hero-figura.jpg"
}

Write-Host "A montar em $stage ..."
New-Item -ItemType Directory -Path $stage -Force | Out-Null

Get-ChildItem -Path $raiz -Force | Where-Object { $excluir -notcontains $_.Name } | ForEach-Object {
  Copy-Item $_.FullName -Destination $stage -Recurse -Force
}

# Segunda passagem: apanhar pastas excluidas que estejam aninhadas mais fundo.
foreach ($nome in $excluir) {
  Get-ChildItem -Path $stage -Recurse -Force -Filter $nome -ErrorAction SilentlyContinue |
    ForEach-Object { Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue }
}

# Travao de seguranca: o video sem proveniencia nao pode existir no pacote.
$proibidos = Get-ChildItem -Path $stage -Recurse -Force -Include "ambient.mp4" -ErrorAction SilentlyContinue
if ($proibidos) {
  Remove-Item $stage -Recurse -Force
  throw "ABORTADO: encontrado ambient.mp4 no pacote. Esse ficheiro nao tem proveniencia e nao pode ser vendido."
}

# O README do comprador entra com o nome README.md.
Copy-Item (Join-Path $raiz "README-TEMPLATE.md") -Destination (Join-Path $stage "README.md") -Force

# O manual em HTML, gerado por scripts/docs-para-html.js. O comprador deve
# poder abri-lo no browser sem depender de um leitor de Markdown.
$docHtml = Join-Path $raiz "documentation\index.html"
if (Test-Path $docHtml) {
  New-Item -ItemType Directory -Path (Join-Path $stage "documentation") -Force | Out-Null
  Copy-Item $docHtml -Destination (Join-Path $stage "documentation\index.html") -Force
} else {
  throw "ABORTADO: falta documentation/index.html. Correr: node scripts/docs-para-html.js"
}

# Trocar as imagens sem proveniencia pelos placeholders, so dentro do pacote.
$trocadas = 0
foreach ($rel in $substituir.Keys) {
  $alvo = Join-Path $stage (Join-Path "public\imagens" $rel)
  $fonte = Join-Path $stage ("public\imagens\placeholder\" + $substituir[$rel])
  if ((Test-Path $alvo) -and (Test-Path $fonte)) {
    Copy-Item $fonte -Destination $alvo -Force
    $trocadas++
  } elseif (-not (Test-Path $fonte)) {
    throw "ABORTADO: placeholder em falta -> $fonte"
  }
}
Write-Host "Imagens sem proveniencia substituidas por placeholders: $trocadas de $($substituir.Count)"

# Travao: nenhuma das 9 pode sobreviver no pacote com o conteudo original.
foreach ($rel in $substituir.Keys) {
  $alvo  = Join-Path $stage (Join-Path "public\imagens" $rel)
  $orig  = Join-Path $raiz  (Join-Path "public\imagens" $rel)
  if ((Test-Path $alvo) -and (Test-Path $orig)) {
    $a = (Get-FileHash $alvo).Hash; $o = (Get-FileHash $orig).Hash
    if ($a -eq $o) {
      Remove-Item $stage -Recurse -Force
      throw "ABORTADO: $rel entrou no pacote com o conteudo original."
    }
  }
}

if (Test-Path $destino) { Remove-Item $destino -Force }
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $destino -Force
Remove-Item $stage -Recurse -Force

$mb = [math]::Round((Get-Item $destino).Length / 1MB, 2)
Write-Host ""
Write-Host "Pacote pronto: $destino  ($mb MB)"
Write-Host ""
Write-Host "Conteudo de topo:"
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($destino)
$zip.Entries | ForEach-Object { ($_.FullName -split '/')[0] } | Sort-Object -Unique | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host ("Total de ficheiros: " + $zip.Entries.Count)
$zip.Dispose()
