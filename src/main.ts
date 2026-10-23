import Phaser from 'phaser';
import './style.css';

type FighterId = 'bob' | 'julio' | 'orc' | 'teddy';
type StageId = 'grass' | 'ship' | 'castle' | 'picnic';
type GameMode = 1 | 2;

type FighterConfig = {
  id: FighterId;
  name: string;
  speed: number;
  jump: number;
  maxJumps: number;
  health: number;
  scale: number;
  damage: { light: number; heavy: number; special: number };
  color: number;
  style: string;
};

const WIDTH = 1672;
const HEIGHT = 941;
const GROUND_Y = 805;

const fighters: Record<FighterId, FighterConfig> = {
  bob: { id: 'bob', name: 'BOB', speed: 265, jump: 625, maxJumps: 1, health: 100, scale: 1.15, damage: { light: 7, heavy: 13, special: 17 }, color: 0x45c96b, style: 'Espadachim equilibrado' },
  julio: { id: 'julio', name: 'JÚLIO', speed: 282, jump: 655, maxJumps: 2, health: 94, scale: 1.18, damage: { light: 6, heavy: 10, special: 13 }, color: 0xffd8e6, style: 'Ágil, pulo duplo e ovos' },
  orc: { id: 'orc', name: 'ORC', speed: 220, jump: 555, maxJumps: 1, health: 118, scale: 1.62, damage: { light: 9, heavy: 18, special: 24 }, color: 0xf3bb2a, style: 'Pesado, resistente e brutal' },
  teddy: { id: 'teddy', name: 'TEDDY', speed: 332, jump: 680, maxJumps: 1, health: 92, scale: 1.18, damage: { light: 6, heavy: 10, special: 15 }, color: 0x2675de, style: 'Artes marciais e velocidade' },
};

const stages: { id: StageId; name: string; texture: string }[] = [
  { id: 'grass', name: 'CAMPO DOS BLOCOS', texture: 'stage-grass' },
  { id: 'ship', name: 'CONVÉS PIRATA', texture: 'stage-ship' },
  { id: 'castle', name: 'CASTELO REAL', texture: 'stage-castle' },
  { id: 'picnic', name: 'PIQUENIQUE', texture: 'stage-picnic' },
];

const session = {
  mode: 1 as GameMode,
  p1: 'bob' as FighterId,
  p2: 'orc' as FighterId,
  stage: 'castle' as StageId,
};

function fitCover(image: Phaser.GameObjects.Image, width = WIDTH, height = HEIGHT) {
  const sx = width / image.width;
  const sy = height / image.height;
  image.setScale(Math.max(sx, sy));
}

function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, fill = 0x161d2d, alpha = 0.9, stroke = 0xf6b72d) {
  return scene.add.rectangle(x, y, w, h, fill, alpha).setStrokeStyle(5, stroke, 1);
}

function button(scene: Phaser.Scene, x: number, y: number, w: number, h: number, label: string, onClick: () => void, fill = 0x7a3b16) {
  const c = scene.add.container(x, y);
  const shadow = scene.add.rectangle(0, 7, w, h, 0x210f06, 0.7).setStrokeStyle(4, 0x2b1309);
  const bg = scene.add.rectangle(0, 0, w, h, fill, 1).setStrokeStyle(4, 0xe7a947);
  const shine = scene.add.rectangle(0, -h * 0.18, w - 12, h * 0.28, 0xffffff, 0.09);
  const t = scene.add.text(0, 0, label, { fontFamily: 'Impact, Arial Black, sans-serif', fontSize: `${Math.round(h * 0.47)}px`, color: '#fff7d5', stroke: '#2c1207', strokeThickness: 7 }).setOrigin(0.5);
  c.add([shadow, bg, shine, t]);
  c.setSize(w, h).setInteractive({ useHandCursor: true });
  c.on('pointerover', () => c.setScale(1.035));
  c.on('pointerout', () => c.setScale(1));
  c.on('pointerdown', () => c.setScale(0.98));
  c.on('pointerup', () => { c.setScale(1.035); onClick(); });
  return c;
}


function fighterScale(id: FighterId, context: 'large' | 'card' | 'hud' = 'large') {
  if (context === 'hud') return id === 'orc' ? 0.78 : 0.52;
  if (context === 'card') return id === 'orc' ? 0.80 : 0.58;
  return id === 'orc' ? 1.58 : id === 'bob' ? 1.22 : 1.18;
}

function addGoldTitle(scene: Phaser.Scene, text: string, x: number, y: number, size = 66) {
  return scene.add.text(x, y, text, {
    fontFamily: 'Impact, Arial Black, sans-serif',
    fontSize: size + 'px',
    color: '#ffd53b',
    stroke: '#5a2205',
    strokeThickness: 10,
    shadow: { offsetX: 0, offsetY: 6, color: '#1b0800', blur: 2, fill: true }
  }).setOrigin(0.5);
}

class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }
  preload() {
    this.load.image('menu-final', '/assets/menu.avif');
    this.load.image('ui-atlas', '/assets/ui.atlas.avif');
    this.load.image('stage-atlas', '/assets/stages.atlas.avif');
  }

  create() {
    const ui = this.textures.get('ui-atlas');
    ui.add('bob', 0, 0, 0, 256, 450);
    ui.add('julio', 0, 256, 0, 256, 450);
    ui.add('teddy', 0, 512, 0, 256, 450);
    ui.add('orc', 0, 768, 0, 256, 450);
    ui.add('logo', 0, 0, 450, 1024, 318);

    const stage = this.textures.get('stage-atlas');
    stage.add('grass', 0, 0, 0, 480, 270);
    stage.add('ship', 0, 480, 0, 480, 270);
    stage.add('castle', 0, 0, 270, 480, 270);
    stage.add('picnic', 0, 480, 270, 480, 270);

    this.scene.start('menu');
  }
}

class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }
  create() {
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'menu-final');
    bg.setDisplaySize(WIDTH, HEIGHT);

    const one = this.add.zone(820, 626, 520, 90).setInteractive({ useHandCursor: true });
    const two = this.add.zone(820, 742, 520, 90).setInteractive({ useHandCursor: true });
    const play = this.add.zone(820, 515, 520, 95).setInteractive({ useHandCursor: true });

    const glow = (zone: Phaser.GameObjects.Zone, y: number) => {
      const g = this.add.rectangle(820, y, 535, 98, 0xffdd55, 0)
        .setStrokeStyle(5, 0xffdf55, 0)
        .setBlendMode(Phaser.BlendModes.ADD);
      zone.on('pointerover', () => g.setAlpha(0.12).setStrokeStyle(5, 0xffdf55, 0.95));
      zone.on('pointerout', () => g.setAlpha(0).setStrokeStyle(5, 0xffdf55, 0));
    };
    glow(play, 515); glow(one, 626); glow(two, 742);

    play.on('pointerup', () => { session.mode = 1; this.scene.start('character'); });
    one.on('pointerup', () => { session.mode = 1; this.scene.start('character'); });
    two.on('pointerup', () => { session.mode = 2; this.scene.start('character'); });

    const controls = button(this, WIDTH - 152, HEIGHT - 55, 250, 64, 'CONTROLES', () => this.scene.start('controls'), 0x194b88);
    controls.setDepth(10);
  }
}

class ControlsScene extends Phaser.Scene {
  constructor() { super('controls'); }
  create() {
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'stage-atlas', 'castle').setDisplaySize(WIDTH, HEIGHT);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x08172d, 0.62);
    this.add.image(WIDTH / 2, 104, 'ui-atlas', 'logo').setDisplaySize(470, 220);
    addGoldTitle(this, 'CONTROLES', WIDTH / 2, 240, 70);

    const leftPanel = panel(this, 465, 525, 600, 440, 0x062852, 0.91, 0x3cc9ff);
    const rightPanel = panel(this, 1207, 525, 600, 440, 0x4b0e15, 0.91, 0xff4458);
    leftPanel.setStrokeStyle(7, 0x52d6ff);
    rightPanel.setStrokeStyle(7, 0xff5365);

    this.add.text(465, 340, 'JOGADOR 1', { fontFamily: 'Impact', fontSize: '52px', color: '#8ce8ff', stroke: '#02162e', strokeThickness: 7 }).setOrigin(0.5);
    this.add.text(1207, 340, 'JOGADOR 2', { fontFamily: 'Impact', fontSize: '52px', color: '#ff9aa4', stroke: '#300008', strokeThickness: 7 }).setOrigin(0.5);

    const left = ['A / D    MOVER', 'W        PULAR', 'F        ATAQUE RÁPIDO', 'G        ATAQUE FORTE', 'H        ESPECIAL'];
    const right = ['← / →    MOVER', '↑        PULAR', 'J        ATAQUE RÁPIDO', 'K        ATAQUE FORTE', 'L        ESPECIAL'];
    this.add.text(245, 405, left.join('\n\n'), { fontFamily: 'Arial Black', fontSize: '27px', color: '#ffffff' });
    this.add.text(982, 405, right.join('\n\n'), { fontFamily: 'Arial Black', fontSize: '27px', color: '#ffffff' });
    this.add.text(WIDTH / 2, 785, 'JÚLIO: aperte o pulo novamente no ar para o segundo impulso', { fontFamily: 'Arial Black', fontSize: '23px', color: '#ffe09a', stroke: '#3a1a05', strokeThickness: 4 }).setOrigin(0.5);
    button(this, WIDTH / 2, 858, 300, 70, 'VOLTAR', () => this.scene.start('menu'), 0x4c4c58);
  }
}

class CharacterScene extends Phaser.Scene {
  private turn: 1 | 2 = 1;
  private status!: Phaser.GameObjects.Text;
  private p1Art!: Phaser.GameObjects.Image;
  private p2Art!: Phaser.GameObjects.Image;
  private cardBorders = new Map<FighterId, Phaser.GameObjects.Rectangle>();

  constructor() { super('character'); }

  create() {
    this.turn = 1;
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'stage-atlas', 'castle').setDisplaySize(WIDTH, HEIGHT);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x07152a, 0.45);

    this.add.image(WIDTH / 2, 102, 'ui-atlas', 'logo').setDisplaySize(480, 225);
    this.status = this.add.text(WIDTH / 2, 220, '', {
      fontFamily: 'Impact', fontSize: '42px', color: '#ffffff', stroke: '#251005', strokeThickness: 7
    }).setOrigin(0.5);

    this.add.rectangle(325, 445, 535, 455, 0x082f62, 0.86).setStrokeStyle(8, 0x39cfff);
    this.add.rectangle(WIDTH - 325, 445, 535, 455, 0x620f18, 0.86).setStrokeStyle(8, 0xff4356);
    this.add.text(325, 262, 'JOGADOR 1', { fontFamily: 'Impact', fontSize: '45px', color: '#d6f6ff', stroke: '#00162d', strokeThickness: 7 }).setOrigin(0.5);
    this.add.text(WIDTH - 325, 262, session.mode === 1 ? 'CPU' : 'JOGADOR 2', { fontFamily: 'Impact', fontSize: '45px', color: '#ffe3e5', stroke: '#370007', strokeThickness: 7 }).setOrigin(0.5);

    this.p1Art = this.add.image(325, 490, 'ui-atlas', session.p1).setOrigin(0.5, 0.62).setScale(fighterScale(session.p1, 'large'));
    this.p2Art = this.add.image(WIDTH - 325, 490, 'ui-atlas', session.p2).setOrigin(0.5, 0.62).setScale(fighterScale(session.p2, 'large')).setFlipX(true);

    const ids: FighterId[] = ['bob', 'julio', 'teddy', 'orc'];
    ids.forEach((id, i) => this.createCard(id, 625 + i * 145, 680));

    button(this, WIDTH / 2, 830, 430, 78, 'CONFIRMAR', () => this.confirm(), 0xb76b0e);
    button(this, WIDTH / 2, 902, 255, 54, 'VOLTAR', () => this.scene.start('menu'), 0x454856);
    this.refreshStatus();
    this.refreshSelection();
  }

  createCard(id: FighterId, x: number, y: number) {
    const c = this.add.container(x, y);
    const border = this.add.rectangle(0, 0, 128, 128, 0x171a22, 0.97).setStrokeStyle(5, 0x817c74);
    const portrait = this.add.image(0, 13, 'ui-atlas', id).setOrigin(0.5, 0.62).setScale(fighterScale(id, 'card'));
    c.add([border, portrait]);
    c.setSize(128, 128).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => c.setScale(1.07));
    c.on('pointerout', () => c.setScale(1));
    c.on('pointerup', () => this.select(id));
    this.cardBorders.set(id, border);
  }

  select(id: FighterId) {
    if (this.turn === 1) {
      session.p1 = id;
      this.p1Art.setFrame(id).setScale(fighterScale(id, 'large'));
      if (session.mode === 1 && session.p2 === id) {
        session.p2 = (['bob','julio','orc','teddy'] as FighterId[]).find(v => v !== id)!;
        this.p2Art.setFrame(session.p2).setScale(fighterScale(session.p2, 'large'));
      }
    } else {
      session.p2 = id;
      this.p2Art.setFrame(id).setScale(fighterScale(id, 'large')).setFlipX(true);
    }
    this.refreshSelection();
  }

  confirm() {
    if (session.mode === 1) {
      const pool = (['bob', 'julio', 'orc', 'teddy'] as FighterId[]).filter(v => v !== session.p1);
      if (session.p2 === session.p1) session.p2 = Phaser.Utils.Array.GetRandom(pool);
      this.scene.start('stage');
      return;
    }
    if (this.turn === 1) {
      this.turn = 2;
      if (session.p2 === session.p1) session.p2 = (['bob','julio','orc','teddy'] as FighterId[]).find(v => v !== session.p1)!;
      this.p2Art.setFrame(session.p2).setScale(fighterScale(session.p2, 'large')).setFlipX(true);
      this.refreshStatus();
      this.refreshSelection();
    } else {
      this.scene.start('stage');
    }
  }

  refreshSelection() {
    this.cardBorders.forEach((border, id) => {
      const selected = this.turn === 1 ? session.p1 === id : session.p2 === id;
      border.setStrokeStyle(selected ? 7 : 5, selected ? (this.turn === 1 ? 0x46d5ff : 0xff4d61) : 0x817c74);
    });
  }

  refreshStatus() {
    this.status.setText(this.turn === 1 ? 'JOGADOR 1 — ESCOLHA SEU LUTADOR' : 'JOGADOR 2 — ESCOLHA SEU LUTADOR');
    this.status.setColor(this.turn === 1 ? '#8de8ff' : '#ffadb5');
  }
}

class StageScene extends Phaser.Scene {
  constructor() { super('stage'); }

  create() {
    this.add.image(WIDTH / 2, HEIGHT / 2, 'stage-atlas', 'castle').setDisplaySize(WIDTH, HEIGHT);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x281309, 0.48);

    this.add.image(225, 120, 'ui-atlas', 'logo').setDisplaySize(390, 185);
    const sign = this.add.rectangle(WIDTH / 2 + 120, 150, 690, 150, 0x6b3518, 0.97).setStrokeStyle(8, 0x321306);
    sign.setAngle(-1);
    addGoldTitle(this, 'ESCOLHA O CENÁRIO', WIDTH / 2 + 120, 150, 62);

    stages.forEach((stage, i) => {
      const x = 245 + i * 395;
      const y = 535;
      const c = this.add.container(x, y);
      const shadow = this.add.rectangle(7, 9, 352, 248, 0x160704, 0.8);
      const border = this.add.rectangle(0, 0, 352, 248, 0x2b140b, 0.96).setStrokeStyle(7, 0xa96527);
      const pic = this.add.image(0, -15, 'stage-atlas', stage.id).setDisplaySize(328, 184);
      const title = this.add.text(0, 103, stage.name, {
        fontFamily: 'Impact', fontSize: '25px', color: '#fff0bd', stroke: '#2b0c02', strokeThickness: 6
      }).setOrigin(0.5);
      c.add([shadow, border, pic, title]);
      c.setSize(352, 248).setInteractive({ useHandCursor: true });
      c.on('pointerover', () => { c.setScale(1.055); border.setStrokeStyle(8, 0xffca2b); });
      c.on('pointerout', () => { c.setScale(1); border.setStrokeStyle(7, 0xa96527); });
      c.on('pointerup', () => { session.stage = stage.id; this.scene.start('fight'); });
    });

    this.add.image(190, 330, 'ui-atlas', session.p1).setScale(fighterScale(session.p1, 'large') * 0.72).setOrigin(0.5, 0.6);
    this.add.image(WIDTH - 190, 330, 'ui-atlas', session.p2).setScale(fighterScale(session.p2, 'large') * 0.72).setOrigin(0.5, 0.6).setFlipX(true);
    button(this, 165, 870, 245, 62, 'VOLTAR', () => this.scene.start('character'), 0x4c4c58);
  }
}

type FighterRuntime = {
  cfg: FighterConfig;
  sprite: Phaser.Physics.Arcade.Sprite;
  health: number;
  jumps: number;
  attacking: boolean;
  stunned: boolean;
  facing: 1 | -1;
  lastAttackAt: number;
  ai?: boolean;
};

class FightScene extends Phaser.Scene {
  private p1!: FighterRuntime;
  private p2!: FighterRuntime;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private p1Bar!: Phaser.GameObjects.Rectangle;
  private p2Bar!: Phaser.GameObjects.Rectangle;
  private timerText!: Phaser.GameObjects.Text;
  private roundSeconds = 99;
  private ended = false;
  private paused = false;
  private p1Wins = 0;
  private p2Wins = 0;
  private projectiles: { owner: FighterRuntime; object: Phaser.Physics.Arcade.Image; damage: number }[] = [];

  constructor() { super('fight'); }
  create() {
    this.roundSeconds = 99;
    this.ended = false;
    this.paused = false;
    this.projectiles = [];
    const stage = stages.find(s => s.id === session.stage)!;
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'stage-atlas', stage.id).setDisplaySize(WIDTH, HEIGHT);
    this.add.rectangle(WIDTH / 2, HEIGHT - 52, WIDTH, 104, 0x000000, 0.08);

    const floor = this.physics.add.staticImage(WIDTH / 2, GROUND_Y + 78, '__DEFAULT').setDisplaySize(WIDTH, 110).setVisible(false).refreshBody();
    const leftWall = this.physics.add.staticImage(-15, HEIGHT / 2, '__DEFAULT').setDisplaySize(30, HEIGHT).setVisible(false).refreshBody();
    const rightWall = this.physics.add.staticImage(WIDTH + 15, HEIGHT / 2, '__DEFAULT').setDisplaySize(30, HEIGHT).setVisible(false).refreshBody();

    this.p1 = this.spawn(session.p1, 380, GROUND_Y, 1, false);
    this.p2 = this.spawn(session.p2, 1285, GROUND_Y, -1, session.mode === 1);
    [this.p1, this.p2].forEach(f => {
      this.physics.add.collider(f.sprite, floor);
      this.physics.add.collider(f.sprite, leftWall);
      this.physics.add.collider(f.sprite, rightWall);
    });
    this.physics.add.collider(this.p1.sprite, this.p2.sprite);

    this.createHud();
    this.createKeys();

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.ended && !this.paused) {
          this.roundSeconds--;
          this.timerText.setText(String(Math.max(0, this.roundSeconds)).padStart(2, '0'));
          if (this.roundSeconds <= 0) this.finishByTime();
        }
      }
    });

    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.showAnnouncement('ROUND 1', () => this.showAnnouncement('LUTEM!', undefined, 520));
  }

  spawn(id: FighterId, x: number, y: number, facing: 1 | -1, ai: boolean): FighterRuntime {
    const cfg = fighters[id];
    const s = this.physics.add.sprite(x, y, 'ui-atlas', id).setOrigin(0.5, 1).setScale(cfg.scale);
    s.setCollideWorldBounds(false).setBounce(0).setDragX(1800).setMaxVelocity(cfg.speed * 1.6, 1000);
    (s.body as Phaser.Physics.Arcade.Body).setSize(s.width * 0.50, s.height * 0.72, true);
    const f: FighterRuntime = { cfg, sprite: s, health: cfg.health, jumps: cfg.maxJumps, attacking: false, stunned: false, facing, lastAttackAt: 0, ai };
    this.updateFacing(f, facing);

    this.tweens.add({
      targets: s,
      scaleY: cfg.scale * 0.985,
      scaleX: cfg.scale * 1.012,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    return f;
  }

  createHud() {
    this.add.rectangle(WIDTH / 2, 74, WIDTH, 148, 0x031323, 0.58);
    this.add.rectangle(440, 80, 585, 44, 0x09121a, 0.94).setStrokeStyle(5, 0x4fc9ff);
    this.add.rectangle(1232, 80, 585, 44, 0x09121a, 0.94).setStrokeStyle(5, 0xff4c5f);
    this.p1Bar = this.add.rectangle(440 - 284, 80, 568, 30, 0x70e12f).setOrigin(0, 0.5);
    this.p2Bar = this.add.rectangle(1232 + 284, 80, 568, 30, 0x70e12f).setOrigin(1, 0.5);
    this.add.image(80, 84, 'ui-atlas', session.p1).setDisplaySize(102, 118);
    this.add.image(WIDTH - 80, 84, 'ui-atlas', session.p2).setDisplaySize(102, 118);
    this.add.text(145, 26, `P1  ${fighters[session.p1].name}`, { fontFamily: 'Impact', fontSize: '34px', color: '#b9eaff', stroke: '#001628', strokeThickness: 6 });
    this.add.text(WIDTH - 145, 26, `${fighters[session.p2].name}  ${session.mode === 1 ? 'CPU' : 'P2'}`, { fontFamily: 'Impact', fontSize: '34px', color: '#ffbac0', stroke: '#2a0004', strokeThickness: 6 }).setOrigin(1, 0);
    panel(this, WIDTH / 2, 75, 150, 110, 0x10213a, 0.98, 0xffb82e);
    this.timerText = this.add.text(WIDTH / 2, 74, '99', { fontFamily: 'Impact', fontSize: '72px', color: '#fff4b5', stroke: '#130b05', strokeThickness: 9 }).setOrigin(0.5);
  }

  createKeys() {
    const kb = this.input.keyboard!;
    this.keys = {
      p1Left: kb.addKey('A'),
      p1Right: kb.addKey('D'),
      p1Jump: kb.addKey('W'),
      p1Light: kb.addKey('F'),
      p1Heavy: kb.addKey('G'),
      p1Special: kb.addKey('H'),
      p2Left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      p2Right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      p2Jump: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      p2Light: kb.addKey('J'),
      p2Heavy: kb.addKey('K'),
      p2Special: kb.addKey('L'),
    };
  }

  update() {
    if (this.ended || this.paused) return;
    this.controlPlayer(this.p1, 'p1');
    if (this.p2.ai) this.controlAI(this.p2, this.p1); else this.controlPlayer(this.p2, 'p2');
    this.faceEachOther();
    this.updateProjectiles();
  }

  controlPlayer(f: FighterRuntime, prefix: 'p1' | 'p2') {
    if (f.stunned) return;
    const left = this.keys[`${prefix}Left`];
    const right = this.keys[`${prefix}Right`];
    const jump = this.keys[`${prefix}Jump`];

    if (!f.attacking) {
      if (left.isDown) f.sprite.setVelocityX(-f.cfg.speed);
      else if (right.isDown) f.sprite.setVelocityX(f.cfg.speed);
      else f.sprite.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(jump) && f.jumps > 0) {
      f.sprite.setVelocityY(-f.cfg.jump);
      f.jumps--;
      this.squash(f, 0.88, 1.10, 90);
    }
    if ((f.sprite.body as Phaser.Physics.Arcade.Body).blocked.down) f.jumps = f.cfg.maxJumps;

    if (Phaser.Input.Keyboard.JustDown(this.keys[`${prefix}Light`])) this.attack(f, 'light');
    if (Phaser.Input.Keyboard.JustDown(this.keys[`${prefix}Heavy`])) this.attack(f, 'heavy');
    if (Phaser.Input.Keyboard.JustDown(this.keys[`${prefix}Special`])) this.attack(f, 'special');
  }

  controlAI(ai: FighterRuntime, target: FighterRuntime) {
    if (ai.stunned || ai.attacking) return;
    const dx = target.sprite.x - ai.sprite.x;
    const dist = Math.abs(dx);

    if (dist > 235) ai.sprite.setVelocityX(Math.sign(dx) * ai.cfg.speed * 0.78);
    else ai.sprite.setVelocityX(0);

    if (dist < 190 && this.time.now - ai.lastAttackAt > 580) {
      const r = Math.random();
      this.attack(ai, r < 0.55 ? 'light' : r < 0.86 ? 'heavy' : 'special');
    } else if (dist > 270 && (ai.cfg.id === 'julio' || ai.cfg.id === 'teddy') && Math.random() < 0.008) {
      this.attack(ai, 'special');
    }

    if ((ai.sprite.body as Phaser.Physics.Arcade.Body).blocked.down && dist > 380 && Math.random() < 0.004) {
      ai.sprite.setVelocityY(-ai.cfg.jump);
      ai.jumps--;
    }
    if ((ai.sprite.body as Phaser.Physics.Arcade.Body).blocked.down) ai.jumps = ai.cfg.maxJumps;
  }

  faceEachOther() {
    if (!this.p1.attacking) this.updateFacing(this.p1, this.p1.sprite.x <= this.p2.sprite.x ? 1 : -1);
    if (!this.p2.attacking) this.updateFacing(this.p2, this.p2.sprite.x <= this.p1.sprite.x ? 1 : -1);
  }

  updateFacing(f: FighterRuntime, dir: 1 | -1) {
    f.facing = dir;
    f.sprite.setFlipX(dir < 0);
  }

  attack(f: FighterRuntime, kind: 'light' | 'heavy' | 'special') {
    if (f.attacking || f.stunned || this.time.now - f.lastAttackAt < 150) return;
    f.attacking = true;
    f.lastAttackAt = this.time.now;

    const enemy = f === this.p1 ? this.p2 : this.p1;
    const spec = kind === 'light'
      ? { wind: 70, active: 80, recover: 130, range: 125, move: 34 }
      : kind === 'heavy'
        ? { wind: 130, active: 110, recover: 230, range: 162, move: 52 }
        : { wind: 165, active: 120, recover: 320, range: 205, move: 72 };

    if (kind === 'special' && (f.cfg.id === 'julio' || f.cfg.id === 'teddy')) {
      this.time.delayedCall(spec.wind, () => this.spawnProjectile(f, f.cfg.id === 'julio' ? 'egg' : 'chi', f.cfg.damage.special));
    } else {
      this.time.delayedCall(spec.wind, () => {
        const dist = Math.abs(enemy.sprite.x - f.sprite.x);
        const vertical = Math.abs(enemy.sprite.y - f.sprite.y);
        const inFront = f.facing === 1 ? enemy.sprite.x > f.sprite.x : enemy.sprite.x < f.sprite.x;
        if (dist < spec.range && vertical < 150 && inFront) this.hit(enemy, f, f.cfg.damage[kind], kind);
      });
    }

    this.tweens.add({
      targets: f.sprite,
      x: f.sprite.x + spec.move * f.facing,
      angle: kind === 'heavy' ? 7 * f.facing : kind === 'special' ? 11 * f.facing : 4 * f.facing,
      duration: spec.wind,
      yoyo: true,
      hold: spec.active,
      ease: 'Quad.easeOut'
    });
    this.squash(f, kind === 'heavy' ? 1.09 : 1.05, kind === 'heavy' ? 0.92 : 0.96, spec.wind);
    this.time.delayedCall(spec.wind + spec.active + spec.recover, () => {
      f.attacking = false;
      f.sprite.setAngle(0);
    });
  }

  spawnProjectile(owner: FighterRuntime, type: 'egg' | 'chi', damage: number) {
    const color = type === 'egg' ? 0xfff3d7 : 0x64d8ff;
    const g = this.add.graphics();

    if (type === 'egg') {
      g.fillStyle(color, 1).fillEllipse(18, 22, 32, 42);
      g.lineStyle(3, 0xe7b96c).strokeEllipse(18, 22, 32, 42);
    } else {
      g.fillStyle(color, 0.95).fillCircle(24, 24, 21);
      g.lineStyle(5, 0xffffff, 0.8).strokeCircle(24, 24, 21);
    }

    const key = `${type}-${this.time.now}`;
    g.generateTexture(key, 48, 48);
    g.destroy();

    const obj = this.physics.add.image(owner.sprite.x + owner.facing * 85, owner.sprite.y - 120, key).setScale(type === 'egg' ? 1 : 1.2);
    (obj.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    obj.setVelocityX(owner.facing * (type === 'egg' ? 520 : 650));
    this.projectiles.push({ owner, object: obj, damage });
  }

  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const target = p.owner === this.p1 ? this.p2 : this.p1;

      if (!p.object.active || p.object.x < -80 || p.object.x > WIDTH + 80) {
        p.object.destroy();
        this.projectiles.splice(i, 1);
        continue;
      }

      const d = Phaser.Math.Distance.Between(p.object.x, p.object.y, target.sprite.x, target.sprite.y - 110);
      if (d < 86) {
        this.hit(target, p.owner, p.damage, 'special');
        p.object.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  hit(target: FighterRuntime, attacker: FighterRuntime, damage: number, kind: 'light' | 'heavy' | 'special') {
    if (this.ended) return;

    target.health = Math.max(0, target.health - damage);
    target.stunned = true;
    target.attacking = false;

    const force = kind === 'light' ? 220 : kind === 'heavy' ? 355 : 470;
    target.sprite.setVelocity(attacker.facing * force, kind === 'special' ? -230 : -130);
    target.sprite.setTintFill(0xffffff);
    this.time.delayedCall(70, () => target.sprite.clearTint());
    this.cameras.main.shake(kind === 'light' ? 55 : 95, kind === 'light' ? 0.002 : 0.006);
    this.hitSpark(target.sprite.x, target.sprite.y - 130, kind);
    this.updateHealthBars();

    this.time.delayedCall(kind === 'light' ? 170 : kind === 'heavy' ? 300 : 380, () => target.stunned = false);
    if (target.health <= 0) this.finish(attacker);
  }

  hitSpark(x: number, y: number, kind: string) {
    const count = kind === 'light' ? 6 : kind === 'heavy' ? 10 : 14;
    for (let i = 0; i < count; i++) {
      const p = this.add.circle(x, y, Phaser.Math.Between(4, 10), i % 2 ? 0xffd338 : 0xffffff, 0.95);
      const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const d = Phaser.Math.Between(45, 120);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d,
        alpha: 0,
        scale: 0.1,
        duration: 220,
        onComplete: () => p.destroy()
      });
    }
  }

  squash(f: FighterRuntime, xMul: number, yMul: number, duration: number) {
    const base = f.cfg.scale;
    this.tweens.add({
      targets: f.sprite,
      scaleX: base * xMul,
      scaleY: base * yMul,
      duration,
      yoyo: true,
      ease: 'Sine.easeOut'
    });
  }

  updateHealthBars() {
    this.p1Bar.displayWidth = 568 * (this.p1.health / this.p1.cfg.health);
    this.p2Bar.displayWidth = 568 * (this.p2.health / this.p2.cfg.health);
    const colorFor = (ratio: number) => ratio > 0.55 ? 0x70e12f : ratio > 0.25 ? 0xffc52d : 0xff3d43;
    this.p1Bar.setFillStyle(colorFor(this.p1.health / this.p1.cfg.health));
    this.p2Bar.setFillStyle(colorFor(this.p2.health / this.p2.cfg.health));
  }

  finishByTime() {
    this.finish(this.p1.health >= this.p2.health ? this.p1 : this.p2);
  }

  finish(winner: FighterRuntime) {
    if (this.ended) return;
    this.ended = true;
    this.p1.sprite.setVelocity(0);
    this.p2.sprite.setVelocity(0);

    if (winner === this.p1) this.p1Wins++; else this.p2Wins++;
    const loser = winner === this.p1 ? this.p2 : this.p1;
    this.tweens.add({ targets: loser.sprite, angle: loser.facing * 80, y: loser.sprite.y + 35, duration: 420, ease: 'Back.easeIn' });
    this.time.delayedCall(450, () => this.showAnnouncement(`${winner.cfg.name} VENCEU!`, () => this.showEndMenu(), 900));
  }

  showEndMenu() {
    panel(this, WIDTH / 2, HEIGHT / 2 + 95, 570, 260, 0x071526, 0.95, 0xffc02f);
    this.add.text(WIDTH / 2, HEIGHT / 2 + 30, `PLACAR  ${this.p1Wins} × ${this.p2Wins}`, { fontFamily: 'Impact', fontSize: '46px', color: '#fff' }).setOrigin(0.5);
    button(this, WIDTH / 2, HEIGHT / 2 + 110, 390, 70, 'REVANCHE', () => this.scene.restart(), 0x874817);
    button(this, WIDTH / 2, HEIGHT / 2 + 190, 390, 62, 'MENU PRINCIPAL', () => this.scene.start('menu'), 0x37465a);
  }

  showAnnouncement(text: string, next?: () => void, duration = 720) {
    const t = this.add.text(WIDTH / 2, HEIGHT / 2 - 60, text, {
      fontFamily: 'Impact',
      fontSize: '92px',
      color: '#ffd83d',
      stroke: '#3b1300',
      strokeThickness: 12
    }).setOrigin(0.5).setScale(0.3).setAlpha(0);

    this.tweens.add({
      targets: t,
      scale: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.easeOut',
      hold: duration,
      yoyo: true,
      onComplete: () => {
        t.destroy();
        next?.();
      }
    });
  }

  togglePause() {
    if (this.ended) return;
    this.paused = !this.paused;
    this.paused ? this.physics.world.pause() : this.physics.world.resume();

    if (this.paused) {
      this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.58).setName('pauseShade').setDepth(100);
      this.add.text(WIDTH / 2, HEIGHT / 2 - 40, 'PAUSADO', { fontFamily: 'Impact', fontSize: '84px', color: '#fff', stroke: '#000', strokeThickness: 10 }).setOrigin(0.5).setName('pauseText').setDepth(101);
      this.add.text(WIDTH / 2, HEIGHT / 2 + 45, 'ESC para continuar', { fontFamily: 'Arial Black', fontSize: '26px', color: '#ffd879' }).setOrigin(0.5).setName('pauseHint').setDepth(101);
    } else {
      ['pauseShade', 'pauseText', 'pauseHint'].forEach(n => this.children.getByName(n)?.destroy());
    }
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#071b36',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 1650 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WIDTH,
    height: HEIGHT
  },
  scene: [BootScene, MenuScene, ControlsScene, CharacterScene, StageScene, FightScene],
  render: { antialias: true, pixelArt: false }
});

export default game;
