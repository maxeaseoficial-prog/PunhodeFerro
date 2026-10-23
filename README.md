# Punho de Ferro

Jogo de luta 2D para navegador feito com **Phaser 3 + TypeScript + Vite**.

## Modos

- **1 jogador:** jogador vs CPU.
- **2 jogadores:** multiplayer local no mesmo teclado.

## Personagens

- **Bob:** espadachim equilibrado, ágil e de alcance médio.
- **Júlio:** ágil, lança ovos e possui pulo duplo.
- **Orc:** mais lento, resistente e com golpes de maior dano.
- **Teddy:** especialista em artes marciais e o mais rápido do elenco.

## Controles

### Jogador 1
- A / D — mover
- W — pular
- F — ataque rápido
- G — ataque forte
- H — especial

### Jogador 2
- ← / → — mover
- ↑ — pular
- J — ataque rápido
- K — ataque forte
- L — especial

**ESC** pausa a partida.

## Fluxo

Menu → modo de jogo → seleção de personagem → seleção de cenário → luta → revanche/menu.

## Assets

A versão visual atual usa os assets finais otimizados que já estão no repositório:

- `public/assets/menu.avif` — menu principal baseado no mockup final.
- `public/assets/ui.atlas.avif` — Bob, Júlio, Teddy, Orc e logo.
- `public/assets/stages.atlas.avif` — Campo dos Blocos, Convés Pirata, Castelo Real e Piquenique.

As telas usam esses assets diretamente no Phaser; os placeholders procedurais deixaram de ser o visual padrão.

## Desenvolvimento

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

A saída fica em `dist/` e o repositório já inclui configuração para deploy na Vercel.
