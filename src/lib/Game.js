export default class Game {
  constructor() {
    this.canvas = document.querySelector("#game");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;

    this.animationId = null;
    this.player = new Player(this.ctx, this.x, this.y, 15, "white");
    this.projectiles = [];
    this.particles = [];
    this.enemies = [];

    this.init();
  }

  init() {
    this.spawnEnemies();
    this.animate();

    document.addEventListener("click", (e) => {
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
        "white",
        {
          x: velocity.x,
          y: velocity.y,
        }
      );

      this.projectiles.push(projectile);
    });
  }

  spawnEnemies() {
    setInterval(() => {
      const radius = Math.random() * (30 - 10) + 10;
      const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
      let x = Math.random() * this.canvas.width;
      let y = Math.random() < 0.5 ? 0 - radius : this.canvas.height + radius;

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
    }, 1000);
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.player.draw();

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

      //distance to player
      const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);

      if (dist - enemy.radius - this.player.radius < 1) {
        cancelAnimationFrame(this.animationId);
      }

      //distance to projectile
      this.projectiles.forEach((projectile, projectileIndex) => {
        const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

        //projectile touch
        if (dist - enemy.radius - projectile.radius < 1) {
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
          } else {
            setTimeout(() => {
              this.enemies.splice(enemyIndex, 1);
              this.projectiles.splice(projectileIndex, 1);
            }, 0);
          }
        }
      });
    });
  }
}

class Player {
  constructor(ctx, x, y, radius, color) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
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