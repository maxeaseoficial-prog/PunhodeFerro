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
  bob: { id: 'bob', name: 'BOB', speed: 265, jump: 625, maxJumps: 1, health: 100, scale: 0.74, damage: { light: 7, heavy: 13, special: 17 }, color: 0x45c96b, style: 'Espadachim equilibrado' },
  julio: { id: 'julio', name: 'JÚLIO', speed: 282, jump: 655, maxJumps: 2, health: 94, scale: 0.68, damage: { light: 6, heavy: 10, special: 13 }, color: 0xffd8e6, style: 'Ágil, pulo duplo e ovos' },
  orc: { id: 'orc', name: 'ORC', speed: 220, jump: 555, maxJumps: 1, health: 118, scale: 0.77, damage: { light: 9, heavy: 18, special: 24 }, color: 0xf3bb2a, style: 'Pesado, resistente e brutal' },
  teddy: { id: 'teddy', name: 'TEDDY', speed: 332, jump: 680, maxJumps: 1, health: 92, scale: 0.67, damage: { light: 6, heavy: 10, special: 15 }, color: 0x2675de, style: 'Artes marciais e velocidade' },
};

const stages: { id: StageId; name: string; texture: string }[] = [
  { id: 'grass', name: 'CAMPO DOS BLOCOS', texture: 'stage-grass' },
  { id: 'ship', name: 'CONVÉS PIRATA', texture: 'stage-ship' },
  { id: 'castle', name: 'CASTELO REAL', texture: 'stages', 'castle' },
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

class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }
  preload() {
    this.load.image('menu', '/assets/menu.jpg');
    this.load.image('logo', '/assets/logo.webp');
    this.load.image('stages', '/assets/stages.jpg');
    this.load.image('fighters', '/assets/fighters.webp');
  }
  create() {
    const stageTex = this.textures.get('stages');
    stageTex.add('grass', 0, 0, 0, 960, 540);
    stageTex.add('ship', 0, 960, 0, 960, 540);
    stageTex.add('castle', 0, 0, 540, 960, 540);
    stageTex.add('picnic', 0, 960, 540, 960, 540);

    const fighterTex = this.textures.get('fighters');
    fighterTex.add('bob', 0, 0, 0, 512, 512);
    fighterTex.add('julio', 0, 512, 0, 512, 512);
    fighterTex.add('orc', 0, 0, 512, 512, 512);
    fighterTex.add('teddy', 0, 512, 512, 512, 512);
    this.scene.start('menu');
  }
}

class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }
  create() {
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'menu'); fitCover(bg);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.05);

    const one = this.add.zone(820, 626, 520, 93).setInteractive({ useHandCursor: true });
    const two = this.add.zone(820, 741, 520, 93).setInteractive({ useHandCursor: true });
    const pulse = (z: Phaser.GameObjects.Zone, y: number) => {
      const glow = this.add.rectangle(820, y, 520, 93, 0xffc64a, 0).setStrokeStyle(5, 0xffd86b, 0);
      z.on('pointerover', () => glow.setAlpha(0.14).setStrokeStyle(5, 0xffd86b, 1));
      z.on('pointerout', () => glow.setAlpha(0).setStrokeStyle(5, 0xffd86b, 0));
    };
    pulse(one, 626); pulse(two, 741);
    one.on('pointerup', () => { session.mode = 1; this.scene.start('character'); });
    two.on('pointerup', () => { session.mode = 2; this.scene.start('character'); });

    button(this, WIDTH - 155, HEIGHT - 58, 245, 62, 'CONTROLES', () => this.scene.start('controls'), 0x173f73);
    this.add.text(24, HEIGHT - 28, 'v0.1 • protótipo jogável', { fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#ffffffaa' }).setOrigin(0, 1);
  }
}

class ControlsScene extends Phaser.Scene {
  constructor() { super('controls'); }
  create() {
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'stages', 'castle'); fitCover(bg);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x061a35, 0.68);
    this.add.image(WIDTH / 2, 128, 'logo').setDisplaySize(520, 292);
    this.add.text(WIDTH / 2, 265, 'CONTROLES', { fontFamily: 'Impact', fontSize: '74px', color: '#ffd23e', stroke: '#4d2104', strokeThickness: 9 }).setOrigin(0.5);

    panel(this, 480, 520, 590, 400, 0x062951, 0.92, 0x39b9ff);
    panel(this, 1192, 520, 590, 400, 0x501015, 0.92, 0xff4656);
    this.add.text(480, 355, 'JOGADOR 1', { fontFamily: 'Impact', fontSize: '49px', color: '#7edcff', stroke: '#00192b', strokeThickness: 6 }).setOrigin(0.5);
    this.add.text(1192, 355, 'JOGADOR 2', { fontFamily: 'Impact', fontSize: '49px', color: '#ff858e', stroke: '#2d0004', strokeThickness: 6 }).setOrigin(0.5);

    const left = ['A / D   mover', 'W       pular', 'F       ataque rápido', 'G       ataque forte', 'H       especial'];
    const right = ['← / →   mover', '↑       pular', 'J       ataque rápido', 'K       ataque forte', 'L       especial'];
    this.add.text(290, 410, left.join('\n'), { fontFamily: 'Arial Black', fontSize: '32px', color: '#ffffff', lineSpacing: 21 });
    this.add.text(1000, 410, right.join('\n'), { fontFamily: 'Arial Black', fontSize: '32px', color: '#ffffff', lineSpacing: 21 });
    this.add.text(WIDTH / 2, 760, 'ESC pausa a partida • Júlio pode pular novamente no ar', { fontFamily: 'Arial Black', fontSize: '25px', color: '#ffe0a1' }).setOrigin(0.5);
    button(this, WIDTH / 2, 850, 300, 70, 'VOLTAR', () => this.scene.start('menu'), 0x4c4c58);
  }
}

class CharacterScene extends Phaser.Scene {
  private turn: 1 | 2 = 1;
  private status!: Phaser.GameObjects.Text;
  constructor() { super('character'); }
  create() {
    this.turn = 1;
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'stages', 'castle'); fitCover(bg);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x03172b, 0.50);
    this.add.image(WIDTH / 2, 118, 'logo').setDisplaySize(470, 264);
    this.add.text(WIDTH / 2, 220, 'ESCOLHA SEU LUTADOR', { fontFamily: 'Impact', fontSize: '56px', color: '#ffe559', stroke: '#351104', strokeThickness: 9 }).setOrigin(0.5);
    this.status = this.add.text(WIDTH / 2, 285, '', { fontFamily: 'Arial Black', fontSize: '30px', color: '#ffffff' }).setOrigin(0.5);

    const ids: FighterId[] = ['bob', 'julio', 'teddy', 'orc'];
    ids.forEach((id, i) => this.createCard(id, 265 + i * 380, 535));
    button(this, 170, 860, 240, 65, 'VOLTAR', () => this.scene.start('menu'), 0x4c4c58);
    this.refreshStatus();
  }
  createCard(id: FighterId, x: number, y: number) {
    const f = fighters[id];
    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 320, 430, 0x17243a, 0.94).setStrokeStyle(6, 0xd5d9e6);
    const portrait = this.add.image(0, -35, 'fighters', id).setOrigin(0.5, 0.6);
    portrait.setScale(Math.min(260 / portrait.width, 290 / portrait.height));
    const name = this.add.text(0, 145, f.name, { fontFamily: 'Impact', fontSize: '48px', color: '#ffffff', stroke: '#101010', strokeThickness: 7 }).setOrigin(0.5);
    const style = this.add.text(0, 190, f.style, { fontFamily: 'Arial Black', fontSize: '18px', color: '#ffd887', align: 'center', wordWrap: { width: 285 } }).setOrigin(0.5);
    c.add([bg, portrait, name, style]);
    c.setSize(320, 430).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => c.setScale(1.04));
    c.on('pointerout', () => c.setScale(1));
    c.on('pointerup', () => this.choose(id));
  }
  choose(id: FighterId) {
    if (this.turn === 1) {
      session.p1 = id;
      if (session.mode === 1) {
        const pool = (['bob', 'julio', 'orc', 'teddy'] as FighterId[]).filter(v => v !== id);
        session.p2 = Phaser.Utils.Array.GetRandom(pool);
        this.scene.start('stage');
      } else {
        this.turn = 2;
        this.refreshStatus();
      }
    } else {
      session.p2 = id;
      this.scene.start('stage');
    }
  }
  refreshStatus() {
    this.status.setText(this.turn === 1 ? 'JOGADOR 1 — escolha seu personagem' : 'JOGADOR 2 — escolha seu personagem');
    this.status.setColor(this.turn === 1 ? '#80ddff' : '#ff9aa1');
  }
}

class StageScene extends Phaser.Scene {
  constructor() { super('stage'); }
  create() {
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'stages', 'castle'); fitCover(bg);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x16100d, 0.47);
    this.add.image(240, 120, 'logo').setDisplaySize(410, 230);
    this.add.text(WIDTH / 2 + 120, 165, 'ESCOLHA O CENÁRIO', { fontFamily: 'Impact', fontSize: '68px', color: '#ffd736', stroke: '#4b1f05', strokeThickness: 10 }).setOrigin(0.5);
    stages.forEach((s, i) => {
      const x = 245 + i * 395; const y = 525;
      const frame = this.add.container(x, y);
      const border = this.add.rectangle(0, 0, 350, 245, 0x1b0d06, 0.95).setStrokeStyle(6, 0xb66d25);
      const pic = this.add.image(0, -10, 'stages', s.id).setDisplaySize(326, 184);
      const title = this.add.text(0, 106, s.name, { fontFamily: 'Arial Black', fontSize: '19px', color: '#fff2c6', stroke: '#210b02', strokeThickness: 5 }).setOrigin(0.5);
      frame.add([border, pic, title]);
      frame.setSize(350, 245).setInteractive({ useHandCursor: true });
      frame.on('pointerover', () => { frame.setScale(1.045); border.setStrokeStyle(7, 0xffcf3c); });
      frame.on('pointerout', () => { frame.setScale(1); border.setStrokeStyle(6, 0xb66d25); });
      frame.on('pointerup', () => { session.stage = s.id; this.scene.start('fight'); });
    });
    button(this, 170, 865, 240, 65, 'VOLTAR', () => this.scene.start('character'), 0x4c4c58);
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
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'stages', stage.id); fitCover(bg);
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
    const s = this.physics.add.sprite(x, y, 'fighters', id).setOrigin(0.5, 1).setScale(cfg.scale);
    s.setCollideWorldBounds(false).setBounce(0).setDragX(1800).setMaxVelocity(cfg.speed * 1.6, 1000);
    s.body.setSize(s.width * 0.50, s.height * 0.72, true);
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
    this.add.image(80, 84, 'fighters', session.p1).setDisplaySize(102, 118);
    this.add.image(WIDTH - 80, 84, 'fighters', session.p2).setDisplaySize(102, 118);
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
    if (f.sprite.body.blocked.down) f.jumps = f.cfg.maxJumps;

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

    if (ai.sprite.body.blocked.down && dist > 380 && Math.random() < 0.004) {
      ai.sprite.setVelocityY(-ai.cfg.jump);
      ai.jumps--;
    }
    if (ai.sprite.body.blocked.down) ai.jumps = ai.cfg.maxJumps;
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
    obj.body.setAllowGravity(false);
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
    this.physics.world.isPaused = this.paused;

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
