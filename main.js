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
  this.load.atlas('space', 'assets/space-atlas.png', 'assets/space-atlas.json');
}

function create() {
  this.add.tileSprite(240, 400, 480, 800, 'space', 'Background.png').setScrollFactor(0);

  player = this.physics.add.sprite(240, 700, 'space', 'Player.png');
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();

  bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image });

  enemies = this.physics.add.group();
  for (let i = 0; i < 5; i++) {
    const enemy = enemies.create(
      Phaser.Math.Between(50, 430),
      Phaser.Math.Between(0, 200),
      'space',
      'Enemy.png'
    );
    enemy.setVelocityY(100);
  }

  this.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
    bullet.destroy();
    enemy.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
  });

  scoreText = this.add.text(10, 10, 'Score: 0', { font: '20px monospace', fill: '#fff' });
}

function update(time) {
  if (cursors.left.isDown) player.setVelocityX(-200);
  else if (cursors.right.isDown) player.setVelocityX(200);
  else player.setVelocityX(0);

  if (cursors.space.isDown && time > lastFired) {
    const bullet = bullets.get(player.x, player.y - 20, 'space', 'Laser.png');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -400;
      lastFired = time + 300;
    }
  }

  bullets.children.iterate(b => {
    if (b && b.y < 0) b.destroy();
  });

  enemies.children.iterate(e => {
    if (e && e.y > 800) {
      e.y = 0;
      e.x = Phaser.Math.Between(50, 430);
    }
  });
}
