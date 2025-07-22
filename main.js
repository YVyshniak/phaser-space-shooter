
const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let bullets;
let lastFired = 0;
let enemies;
let score = 0;
let scoreText;

function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('bullet', 'assets/laser.png');
  this.load.image('enemy', 'assets/enemy.png');
  this.load.image('background', 'assets/starfield.png');
}

function create() {
  this.add.tileSprite(240, 400, 480, 800, 'background').setScrollFactor(0);
  player = this.physics.add.sprite(240, 700, 'player').setScale(0.8);
  player.setCollideWorldBounds(true);

  bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image });
  enemies = this.physics.add.group();

  scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#fff' });

  this.time.addEvent({
    delay: 1000,
    callback: () => {
      let x = Phaser.Math.Between(50, 430);
      let enemy = enemies.create(x, 0, 'enemy').setScale(0.8);
      enemy.setVelocityY(100);
    },
    loop: true
  });

  this.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
    bullet.destroy();
    enemy.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
  });

  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  if (cursors.left.isDown) player.setVelocityX(-200);
  else if (cursors.right.isDown) player.setVelocityX(200);
  else player.setVelocityX(0);

  if (cursors.space.isDown && time > lastFired) {
    let bullet = bullets.get();
    if (bullet) {
      bullet.enableBody(true, player.x, player.y - 20, true, true);
      bullet.setVelocityY(-300);
      bullet.setTexture('bullet');
      bullet.setScale(0.5);
      lastFired = time + 300;
    }
  }
}
