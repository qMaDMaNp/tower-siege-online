<template>
  <div class="home-page">
    <canvas v-if="showMenu" id="background-game"></canvas>
    <canvas v-else id="game"></canvas>
    <div style="position:fixed; top: 1rem; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.71); font-size: 2rem; user-select: none;">{{ score }}</div>

    <div v-if="showMenu" class="home-page__content">
      <div class="home-page__menu">
        <template v-if="isAuthorized">
          <div>
            <div style="display: flex; align-items: center; width: 100%;">
              <div class="home-page__board">
                <div class="home-page__board-title">Party</div>
                <ul>
                  <li v-for="player in players" v-if="player.id === currentPlayer.id" style="margin-bottom: 0.5rem;">
                    <div class="" style="display: flex; align-items: center; justify-content: space-between;">
                      <div style="display: flex; align-items: center;">
                        <div style="width: 0.5rem; height: 0.5rem; background: lawngreen; border-radius: 999px; margin-right: 0.5rem;"></div>
                        <div>{{ player.nickname }}</div>
                      </div>
<!--                      <div style="display: flex; align-items: center; justify-content: space-between;">-->
<!--                        <div class="button">-->
<!--                          <button class="button__inner" style="font-size: 12px; padding: 0.25rem 0.5rem; border: 1px solid #fff; background: transparent; color: #ef6f6f">Leave</button>-->
<!--                        </div>-->
<!--                      </div>-->
                    </div>
                  </li>
                </ul>
              </div>

              <div class="home-page__board">
                <div class="home-page__board-title">Players Online ({{ players.length - 1 }})</div>
                <ul>
                  <li v-for="player in players" v-if="player.id !== currentPlayer.id" style="margin-bottom: 0.5rem;">
                    <div class="" style="display: flex; align-items: center; justify-content: space-between;">
                      <div style="display: flex; align-items: center;">
                        <div style="width: 0.5rem; height: 0.5rem; background: lawngreen; border-radius: 999px; margin-right: 0.5rem;"></div>
                        <div>{{ player.nickname }}</div>
                      </div>
                      <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div class="button" style="margin-right: 5px;">
                          <button class="button__inner" style="font-size: 12px; padding: 0.25rem">Invite</button>
                        </div>

                        <div class="button">
                          <button class="button__inner" style="font-size: 12px; padding: 0.25rem">Chat</button>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div class="">
              <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;">
                <div style="max-width: 240px; width: 100%; margin-right: 0.5rem;">
                  <div class="button">
                    <button @click.prevent="startGame" class="button__inner">Play</button>
                  </div>
                </div>

                <div style="max-width: 240px; width: 100%;">
                  <div class="button">
                    <button type="button" class="button__inner" disabled style="background: #b2b2b2" title="Under development">Play Online</button>
                  </div>
                </div>
              </div>

              <div style="max-width: 240px; width: 100%; margin: 0 auto;">
                <div class="button">
                  <button @click="logout" type="button" class="button__inner" style="background: #ef6f6f">Logout</button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-if="!isAuthorized" class="home-page__board">
            <div class="home-page__board-title">Login</div>
            <form @submit.prevent="login" action="/login">
              <div class="form-part">
                <div class="input">
                  <input v-model="nickname" class="input__inner" type="text" placeholder="==> Enter Nickname Here <==">
                </div>
              </div>

              <div>
                <div class="button">
                  <button type="submit" class="button__inner">Play</button>
                </div>
              </div>
            </form>
          </div>
        </template>
      </div>
    </div>

    <div v-else-if="showScoreboard" class="home-page__content">
      <div class="home-page__menu">
        <div class="home-page__board" style="max-width: 500px; width: 100%;">
          <div class="home-page__board-title">Scoreboard</div>
          <div style="text-align: center">
            <div class="">Who needs a scoreboard ?</div>
            <div class="">We already know that</div>
            <div style="font-size: 1.5rem; font-weight: 600; color: cornflowerblue;">YOU ARE THE BEST!</div>
            <div class="">Here`s a fortune cookie for you</div>

            <div style="display: flex; align-items: center; justify-content: center;">
              <div style="max-width: 100px;">
                <img src="../assets/cookie.svg" alt="Fortune cookie" style="width: 100%;">
              </div>

              <div>{{ getFortuneText() }}</div>
            </div>

            <div style="font-size: 10px; margin-bottom: 0.5rem;">
              (Scoreboard will be implemented, but later)
            </div>

            <div style="max-width: 240px; text-align: center; margin: 0 auto;">
              <div class="button">
                <button @click="openMenu" type="button" class="button__inner">Menu</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SocketController from "@/lib/SocketController";
import Game from "@/lib/Game";
import BackgroundGame from "@/lib/BackgroundGame";
const axios = require('axios');

export default {
  name: "HomePage",
  data() {
    return {
      showMenu: true,
      showScoreboard: false,
      backgroundGame: null,
      game: null,
      nickname: '',
      score: 0
    };
  },

  computed: {
    isAuthorized() {
      return this.$store.getters['auth/isAuthorized'];
    },

    players() {
      return this.$store.state.players.players;
    },

    currentPlayer() {
      return this.$store.getters["players/currentPlayer"];
    }
  },

  created() {
    if (this.isAuthorized) {
      this.$store.dispatch('players/get_players', {}, {root: true})
        .then(async () => {
          await SocketController.connect();
          this.initSocketListeners();
        });
    }
  },

  mounted() {
    this.initBackground();
  },

  methods: {
    openMenu() {
      this.showScoreboard = false;
      this.showMenu = true;
      this.$nextTick(this.initBackground);
    },

    getFortuneText() {
      let fortunes = [
        "A cynic is only a frustrated optimist.",
        "We don't know the future, but here's a cookie.",
        "The road to riches is paved with homework.",
        "He who laughs at himself never runs out of things to laugh at.",
        "Avoid taking unnecessary gambles. Lucky numbers: 13, 15, 23",
        "That wasn't chicken.",
        "All fortunes are wrong except this one.",
        "Don't forget you are always on our minds.",
        "Don't eat the paper.",
        "You have rice in your teeth.",
        "Ask your mom instead of a cookie.",
        "This cookie contains 117 calories.",
        "You think it's a secret, but they know.",
        "Do not mistake temptation for opportunity.",
        "A good developer, is a developer who adds cookie to the scoreboard."
      ];

      return fortunes[Math.floor(Math.random() * (14 - 0 + 1) + 0)];
    },

    initBackground() {
      this.backgroundGame = new BackgroundGame();
      this.backgroundGame.start(10);
    },

    startGame() {
      this.showMenu = false;
      if (this.backgroundGame) {
        this.backgroundGame.end();
        this.backgroundGame = null;
      }

      this.$nextTick(() => {
        this.game = new Game();
        this.game.canvas.addEventListener('game:end', this.endGameHandler);
        this.game.canvas.addEventListener('game:projectile-hit', this.projectileHitHandler);
        this.game.start();
      })
    },

    endGameHandler(e) {
      this.game.canvas.removeEventListener('game:end', this.endGameHandler);
      this.game.canvas.removeEventListener('game:projectile-hit', this.projectileHitHandler);
      this.showScoreboard = true;
      this.score = 0;
    },

    projectileHitHandler(e) {
      this.score += 10;
    },

    initSocketListeners() {
      SocketController.socket.on('message', (message) => {
        console.log('hello');
      });

      // initGameSocketListeners
      this.initPlayerSocketListeners();
    },

    initGameSocketListeners() {
      // SocketController.socket.on('game:some-event', (data) => {
      // });
    },

    initPlayerSocketListeners() {
      SocketController.socket.on('player:connect', (player) => {
        this.$store.commit('players/ADD_PLAYER', player)
      });

      SocketController.socket.on('player:disconnect', (playerId) => {
        this.$store.commit('players/REMOVE_PLAYER', playerId)
      });
    },

    async login() {
      if (this.nickname.length < 1) return;

      await this.$store.dispatch('auth/login', this.nickname, {root: true});
      location.href = '/';
    },

    logout() {
      this.$store.commit('auth/REMOVE_CREDENTIALS');
      location.href = '/';
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
