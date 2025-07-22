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
  this.add.image(240, 400, 'background').setDisplaySize(480, 800);

  player = this.physics.add.sprite(240, 700, 'player').setScale(0.45);
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();
  bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image });
  enemies = this.physics.add.group();

  // Collision
  this.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
    bullet.destroy();
    enemy.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
  });

  scoreText = this.add.text(10, 10, 'Score: 0', {
    font: '20px monospace',
    fill: '#fff'
  });

  
  this.time.addEvent({
    delay: 1200,
    loop: true,
    callback: () => spawnEnemy(this)
  });
}

function spawnEnemy(scene) {
  const x = Phaser.Math.Between(50, 430);
  const enemy = scene.physics.add.sprite(x, 0, 'enemy').setScale(0.35);


  const pattern = Phaser.Math.Between(0, 2);
  if (pattern === 0) {
    // Прямий рух
    enemy.setVelocityY(100);
  } else if (pattern === 1) {
    // Зигзаг
    enemy.setVelocity(Phaser.Math.Between(-80, 80), 100);
    enemy.update = function () {
      if (this.x <= 30 || this.x >= 450) {
        this.body.velocity.x *= -1;
      }
    };
  } else if (pattern === 2) {
    // Хвиля
    enemy.waveOffset = Phaser.Math.Between(0, 1000);
    enemy.update = function (time) {
      this.y += 1.5;
      this.x += Math.sin((time + this.waveOffset) * 0.005) * 2;
    };
  }

  enemies.add(enemy);
}


function update(time) {
  // Рух гравця
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
    player.rotation = Phaser.Math.Angle.RotateTo(player.rotation, Phaser.Math.DegToRad(-15), 0.15);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
    player.rotation = Phaser.Math.Angle.RotateTo(player.rotation, Phaser.Math.DegToRad(15), 0.15);
  } else {
    player.setVelocityX(0);
    player.rotation = Phaser.Math.Angle.RotateTo(player.rotation, 0, 0.15);
  }

  // Стрільба
  if (cursors.space.isDown && time > lastFired) {
    const bullet = bullets.get(player.x, player.y - 20, 'laser');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setScale(0.3); // Make the laser smaller
      bullet.setVelocityY(-400);
      lastFired = time + 300;
    }
  }

  // Очищення
  bullets.children.iterate(b => {
    if (b && b.y < 0) b.destroy();
  });

  // Апдейт для кожного ворога
  enemies.children.iterate(e => {
    if (e && e.update) e.update(time);

    if (e && e.y > 850) {
      e.destroy(); // Якщо ворог вилетів за екран — знищити
    }
  });
}

