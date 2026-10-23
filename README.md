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

O jogo procura as artes finais em `public/assets/`:

- `menu.jpg`
- `logo.webp`
- `stage-grass.jpg`
- `stage-ship.jpg`
- `stage-castle.jpg`
- `stage-picnic.jpg`
- `fighters.webp`

Enquanto os binários finais não estiverem presentes, existem fallbacks desenhados pelo próprio Phaser para que a aplicação continue compilando e funcionando.

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
