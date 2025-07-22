const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

let player;
let cursors;
let enemies;
let bullets;
let lastFired = 0;
let score = 0;
let scoreText;

const game = new Phaser.Game(config);

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.image('player', 'assets/player.png');
  this.load.image('enemy', 'assets/enemy.png');
  this.load.image('laser', 'assets/laser.png');
}

function create() {
  // Static background
  this.add.image(240, 400, 'background').setDisplaySize(480, 800);

  // Player setup
  player = this.physics.add.sprite(240, 700, 'player').setScale(0.6);
  player.setCollideWorldBounds(true);

  // Input
  cursors = this.input.keyboard.createCursorKeys();

  // Bullet group
  bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image });

  // Enemies
  enemies = this.physics.add.group();
  for (let i = 0; i < 5; i++) {
    const enemy = enemies.create(
      Phaser.Math.Between(50, 430),
      Phaser.Math.Between(0, 200),
      'enemy'
    );
    enemy.setVelocityY(100);
    enemy.setScale(0.5);
  }

  // Collision
  this.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
    bullet.destroy();
    enemy.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
  });

  // Score text
  scoreText = this.add.text(10, 10, 'Score: 0', {
    font: '20px monospace',
    fill: '#fff'
  });
}

function update(time) {
  // Player movement
  if (cursors.left.isDown) player.setVelocityX(-200);
  else if (cursors.right.isDown) player.setVelocityX(200);
  else player.setVelocityX(0);

  // Shooting
  if (cursors.space.isDown && time > lastFired) {
    const bullet = bullets.get(player.x, player.y - 20, 'laser');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      lastFired = time + 300;
    }
  }

  // Remove bullets offscreen
  bullets.children.iterate(b => {
    if (b && b.y < 0) b.destroy();
  });

  // Recycle enemies
  enemies.children.iterate(e => {
    if (e && e.y > 800) {
      e.y = 0;
      e.x = Phaser.Math.Between(50, 430);
    }
  });
}
