# Fiorescer · Landing page

Landing page institucional da **Fiorescer Fios de Malha**. HTML, CSS e JavaScript
puros, sem build e sem dependências. Basta servir a pasta.

```bash
python -m http.server 4321
```

## Estrutura

```
index.html
assets/
  css/style.css      tokens, componentes e breakpoints (mobile first)
  js/main.js         header, menu lateral, carrosséis, reveals
  img/marca/         logotipos em SVG + favicon
  img/produtos/      recortes dos fios com fundo transparente (webp)
  img/cenas/         fotos de ambiente e de uso (webp)
```

## Identidade

Tudo saiu do material da marca no Drive e do Catálogo 2026.

| Token        | Valor     | Origem                                  |
| ------------ | --------- | --------------------------------------- |
| `--verde`    | `#0E3120` | blocos escuros do catálogo              |
| `--areia`    | `#F4CD93` | faixas e destaques do catálogo          |
| `--laranja`  | `#F97513` | logotipo (SVG oficial)                  |
| `--teal`     | `#274D4D` | variação do logotipo em fundo escuro    |
| `--creme`    | `#FBF7F0` | fundo de página                         |

Tipografia: **Poppins** (200 a 600), a mesma fonte usada no catálogo da empresa,
carregada do Google Fonts. Onde a marca aparece em tamanho de display, usamos o
logotipo em SVG em vez de texto.

Os logotipos foram extraídos dos SVGs oficiais, limpos (classes CSS convertidas
em `fill`, fundo removido) e recortados no `viewBox` do conteúdo:

- `fiorescer-lockup.svg` marca completa com "fios de malha" (header)
- `fiorescer-horizontal.svg` marca + assinatura em linha (uso inline no texto)
- `fiorescer-selo.svg` selo circular (rodapé)
- `fiorescer-mark.svg` só o símbolo (menu lateral, ícone de app)
- `favicon.svg` símbolo sobre quadrado verde

As fotos e os recortes de produto vieram do Catálogo 2026 em PDF, com o canal
alfa preservado, redimensionados e convertidos para WebP.

## Estrutura da página

Segue a peça "Do fio à ideia" e o carrossel "O que você vê em um fio?", com as
frases exatamente como foram escritas no roteiro.

1. **Hero** "Tudo começa com um fio. E pode terminar em algo único."
2. **Carrossel do fio** as 5 artes, na ordem e com as frases originais
3. **Sobre nós** história desde 2002, grupo Voss Têxtil
4. **Nossos fios** carrossel de produto com uma frase útil por linha + ficha técnica
5. **Qualidade** abertura exclusiva do rolo e os 3 diferenciais do catálogo
6. **Revenda** os 6 argumentos dos ícones oficiais do site
7. **Fechamento** "Junte-se a nós e deixe sua imaginação florescer com a Fiorescer!"

## Interações

- Header fixo com fundo ao rolar, recolhe ao descer e volta ao subir.
- No mobile, menu lateral que entra pela direita: trava o scroll, prende o foco,
  fecha no ESC, no véu e ao clicar num link.
- Botão de WhatsApp fixo no canto inferior direito, aparece depois do hero.
  Círculo no mobile, pílula com rótulo no desktop.
- Carrossel do fio: crossfade com zoom lento, avanço automático de 6,8s que pausa
  no hover, no foco, fora da tela e com a aba em segundo plano. Aceita arrasto,
  toque, setas e as barras de progresso.
- Carrossel de produtos: scroll nativo com snap, arrasto com o mouse, setas no
  desktop e barra de progresso. Os cards fora do centro suavizam com
  `animation-timeline: view()` onde houver suporte.
- Reveals por `IntersectionObserver`, com atraso escalonado via `--d`.

Tudo respeita `prefers-reduced-motion: reduce`: o avanço automático para, as
transições somem e o conteúdo aparece direto.

## Contatos usados

WhatsApp (47) 99273-6016 · telefone (47) 3304-0304 · sac@fiorescer.com.br
· Instagram @fiorescer · Facebook Fiorescer Fios · CNPJ 05.015.559/0001-09
