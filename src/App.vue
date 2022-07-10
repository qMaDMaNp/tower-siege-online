<template>
  <div id="app">
    <HomePage/>
  </div>
</template>

<script>
import HomePage from "./components/HomePage.vue";

export default {
  name: "App",
  components: {
    HomePage,
  },
};
</script>

<style lang="scss">
  @font-face {
    font-family: 'VT323';
    src: local('VT323'),
    url('./fonts/VT323-Regular.ttf') format('ttf');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  body {
    font-family: 'VT323', sans-serif;
    padding: 0;
    margin: 0;
  }

  #app {
  }
</style>
