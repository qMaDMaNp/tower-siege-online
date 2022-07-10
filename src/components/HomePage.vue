<template>
  <div class="home-page">
    <canvas id="game"></canvas>

    <div class="home-page__content">
      <div class="home-page__menu">
<!--        <div class="home-page__board">-->
<!--          <div class="home-page__board-title">Party</div>-->
<!--        </div>-->

        <div class="home-page__board">
          <div class="home-page__board-title">Login</div>
          <form action="">
            <div class="form-part">
              <div class="input">
                <input class="input__inner" type="text" placeholder="--> Enter Nickname Here <--">
              </div>
            </div>

            <div>
              <div class="button">
                <button class="button__inner">Play</button>
              </div>
            </div>
          </form>
        </div>

<!--        <div class="home-page__board">-->
<!--          <div class="home-page__board-title">Players Online (0)</div>-->
<!--        </div>-->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {};
  },

  mounted() {
    this.initGame();
  },

  methods: {
    initGame() {
      const canvas = document.querySelector("#game");
      const ctx = canvas.getContext("2d");

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      class Player {
        constructor(x, y, radius, color) {
          this.x = x;
          this.y = y;
          this.radius = radius;
          this.color = color;
        }

        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }

      class Projectile {
        constructor(x, y, radius, color, velocity) {
          this.x = x;
          this.y = y;
          this.radius = radius;
          this.color = color;
          this.velocity = velocity;
        }

        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
          ctx.fillStyle = this.color;
          ctx.fill();
        }

        update() {
          this.draw();
          this.x = this.x + this.velocity.x;
          this.y = this.y + this.velocity.y;
        }
      }

      class Enemy {
        constructor(x, y, radius, color, velocity) {
          this.x = x;
          this.y = y;
          this.radius = radius;
          this.color = color;
          this.velocity = velocity;
        }

        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
          ctx.fillStyle = this.color;
          ctx.fill();
        }

        update() {
          this.draw();
          this.x = this.x + this.velocity.x;
          this.y = this.y + this.velocity.y;
        }
      }

      class Particle {
        constructor(x, y, radius, color, velocity) {
          this.x = x;
          this.y = y;
          this.radius = radius;
          this.color = color;
          this.velocity = velocity;
          this.alpha = 1;
          this.particaleFriction = 0.99;
        }

        draw() {
          ctx.save();
          ctx.globalAlpha = this.alpha;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
          ctx.fillStyle = this.color;
          ctx.fill();
          ctx.restore();
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

      let animationId;
      const x = canvas.width / 2;
      const y = canvas.height / 2;

      const player = new Player(x, y, 15, "white");
      const projectiles = [];
      const particles = [];
      const enemies = [];

      function spawnEnemies() {
        setInterval(() => {
          const radius = Math.random() * (30 - 10) + 10;
          const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
          let x = Math.random() * canvas.width;
          let y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;

          if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
          }

          const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
          const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
          };
          const enemy = new Enemy(x, y, radius, color, {
            x: velocity.x,
            y: velocity.y,
          });

          enemies.push(enemy);
        }, 10);
      }

      function animate() {
        animationId = requestAnimationFrame(animate);
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        player.draw();

        particles.forEach((particle, particleIndex) => {
          if (particle.alpha <= 0) {
            particles.splice(particleIndex, 1);
          } else {
            particle.update();
          }
        });

        projectiles.forEach((projectile, projectileIndex) => {
          projectile.update();

          //remove projectile from game
          if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
          ) {
            setTimeout(() => {
              projectiles.splice(projectileIndex, 1);
            }, 0);
          }
        });

        enemies.forEach((enemy, enemyIndex) => {
          enemy.update();

          //distance to player
          const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

          if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId);
          }

          //distance to projectile
          projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            //projectile touch
            if (dist - enemy.radius - projectile.radius < 1) {
              for (let i = 0; i < 8; i++) {
                particles.push(
                  new Particle(
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
                  projectiles.splice(projectileIndex, 1);
                }, 0);
              } else {
                setTimeout(() => {
                  enemies.splice(enemyIndex, 1);
                  projectiles.splice(projectileIndex, 1);
                }, 0);
              }
            }
          });
        });
      }

      document.addEventListener("click", (e) => {
        const angle = Math.atan2(
          e.clientY - canvas.height / 2,
          e.clientX - canvas.width / 2
        );
        const velocity = {
          x: Math.cos(angle) * 4,
          y: Math.sin(angle) * 4,
        };
        const projectile = new Projectile(
          canvas.width / 2,
          canvas.height / 2,
          5,
          "white",
          {
            x: velocity.x,
            y: velocity.y,
          }
        );

        projectiles.push(projectile);
      });

      spawnEnemies();
      animate();
    }
  }
};
</script>

<style lang="scss" scoped>
  .home-page {
    display: flex;

    &__content {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;

      display: flex;
      justify-content: center;
      align-items: center;

      z-index: 1;
      background: rgb(39 50 112 / 50%);
    }

    &__menu {
      display: flex;
      justify-content: center;
      align-items: center;

      max-width: 100%;
      width: 100%;
    }

    &__board {
      background: rgb(33 33 33 / 60%);
      padding: 1rem;
      margin: 0.5rem;
      border-radius: 0.25rem;
      border: 2px solid white;
      max-width: 240px;
      width: 100%;

      color: #fff;
    }

    &__board-title {
      text-align: center;
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    &__party {}
    &__auth {}
    &__players {}
  }

  .input {
    &__label {
      color: #fff;
    }

    &__inner {
      display: block;
      box-sizing: border-box;
      width: 100%;
      font-weight: 600;
      background: transparent;
      outline: none;
      padding: 0.5rem 0.5rem 0.5rem 0;
      border: 0;

      border-bottom: 2px solid #fff;
      caret-color: deepskyblue;
      color: #fff;

      text-align: center;

      &::placeholder {
        color: white;
      }

      &:focus {
        color: deepskyblue;
        border-color: deepskyblue;

        & + .input__label {
          color: deepskyblue;
        }
      }
    }
  }

  .button {
    &__inner {
      cursor: pointer;
      outline: none;
      width: 100%;
      background: deepskyblue;
      border: 2px solid white;
      color: #fff;
      padding: 0.5rem;
      border-radius: 1rem;
      text-transform: uppercase;
      font-weight: 600;
      transition: 0.25s;

      &:hover {
        background: #0091c2;
      }
    }
  }

  .form-part {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
</style>
