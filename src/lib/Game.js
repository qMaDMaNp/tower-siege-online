export default class Game {
  constructor() {
    this.canvas = document.querySelector("#game");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;

    this.animationId = null;
    this.spawnEnemiesInterval = null;
    this.spawnRatio = 1000;
    this.bots = [];

    this.players = [];
    this.projectiles = [];
    this.particles = [];
    this.enemies = [];

    this.addProjectileClick = this.addProjectile.bind(this);
  }

  start(spawnRatio = 1000, bots = []) {
    this.canvas.dispatchEvent(new CustomEvent('game:start'));

    clearInterval(this.spawnEnemiesInterval);
    cancelAnimationFrame(this.animationId);

    this.spawnRatio = spawnRatio;
    this.bots = bots;

    this.players.push(new Player(this, this.ctx, this.x, this.y, 15, 'white'));

    this.bots.forEach(bot => {
      this.players.push(new Player(this, this.ctx, this.x, this.y, 5, bot.color, true));
    })

    this.projectiles = [];
    this.particles = [];
    this.enemies = [];

    this.spawnEnemies();
    this.animate();

    this.canvas.addEventListener("click", this.addProjectileClick);
  }

  end() {
    this.canvas.dispatchEvent(new CustomEvent('game:end', { detail: { start: true } }));

    cancelAnimationFrame(this.animationId);
    clearInterval(this.spawnEnemiesInterval);

    this.animationId = null;
    this.spawnEnemiesInterval = null;

    this.canvas.removeEventListener("click", this.addProjectileClick);

    this.players.forEach(player => {
      if (player.isBot) player.stopShootEnemies();
    });
  }

  addProjectile(e, color = 'white') {
    const angle = Math.atan2(
      e.clientY - this.canvas.height / 2,
      e.clientX - this.canvas.width / 2
    );
    const velocity = {
      x: Math.cos(angle) * 4,
      y: Math.sin(angle) * 4,
    };
    const projectile = new Projectile(
      this.ctx,
      this.canvas.width / 2,
      this.canvas.height / 2,
      5,
      color,
      {
        x: velocity.x,
        y: velocity.y,
      }
    );

    this.projectiles.push(projectile);
  }

  spawnEnemies() {
    this.spawnEnemiesInterval = setInterval(() => {
      const radius = Math.random() * (30 - 10) + 10;
      const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
      let   x = Math.random() * this.canvas.width;
      let   y = Math.random() < 0.5 ? 0 - radius : this.canvas.height + radius;

      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - radius : this.canvas.width + radius;
        y = Math.random() * this.canvas.height;
      }

      const angle = Math.atan2(this.canvas.height / 2 - y, this.canvas.width / 2 - x);
      const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };
      const enemy = new Enemy(this.ctx, x, y, radius, color, {
        x: velocity.x,
        y: velocity.y,
      });

      this.enemies.push(enemy);
    }, this.spawnRatio);
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.players.forEach(player => player.draw());

    this.particles.forEach((particle, particleIndex) => {
      if (particle.alpha <= 0) {
        this.particles.splice(particleIndex, 1);
      } else {
        particle.update();
      }
    });

    this.projectiles.forEach((projectile, projectileIndex) => {
      projectile.update();

      //remove projectile from game
      if (
        projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > this.canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > this.canvas.height
      ) {
        setTimeout(() => {
          this.projectiles.splice(projectileIndex, 1);
        }, 0);
      }
    });

    this.enemies.forEach((enemy, enemyIndex) => {
      enemy.update();

      this.players.forEach(player => {
        //distance to player
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if (dist - enemy.radius - player.radius < 1) {
          this.end();
        }
      });

      //distance to projectile
      this.projectiles.forEach((projectile, projectileIndex) => {
        const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

        //projectile touch
        if (dist - enemy.radius - projectile.radius < 1) {
          this.canvas.dispatchEvent(new CustomEvent('game:projectile-hit'));

          for (let i = 0; i < 8; i++) {
            this.particles.push(
              new Particle(
                this.ctx,
                projectile.x,
                projectile.y,
                Math.random() * 3,
                enemy.color,
                {
                  x: (Math.random() - 0.5) * (Math.random() * 6),
                  y: (Math.random() - 0.5) * (Math.random() * 6),
                }
              )
            );
          }

          if (enemy.radius - 10 > 5) {
            gsap.to(enemy, { radius: enemy.radius - 10 });

            setTimeout(() => {
              this.projectiles.splice(projectileIndex, 1);
            }, 0);
          }
          else {
            //todo: remove this bad approach
            // setTimeout(() => {
              this.enemies.splice(enemyIndex, 1);
              this.projectiles.splice(projectileIndex, 1);
            // }, 0);
          }
        }
      });
    });
  }
}

class Player {
  constructor(game, ctx, x, y, radius, color, isBot) {
    this.game = game;
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.isBot = isBot || false;
    this.shootEnemitsInterval = null;

    if (this.isBot) this.shootEnemitsInterval = this.startShootEnemies();
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }

  startShootEnemies () {
    return setInterval(() => {
      if (this.game.enemies.length === 0) return;

      let randomEnemy = this.game.enemies[Math.floor(Math.random() * (this.game.enemies.length - 1))];

      if (randomEnemy) {
        let randomClientX = randomEnemy.x;
        let randomClientY = randomEnemy.y;
        this.game.addProjectile({clientX: randomClientX, clientY: randomClientY}, this.color)
      }
    }, 500);
  }

  stopShootEnemies() {
    clearInterval(this.shootEnemitsInterval);
  }
}

class Projectile {
  constructor(ctx, x, y, radius, color, velocity) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(ctx, x, y, radius, color, velocity) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Particle {
  constructor(ctx, x, y, radius, color, velocity) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
    this.particaleFriction = 0.99;
  }

  draw() {
    this.ctx.save();
    this.ctx.globalAlpha = this.alpha;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= this.particaleFriction;
    this.velocity.y *= this.particaleFriction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}