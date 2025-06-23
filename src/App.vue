<script setup lang="ts">
</script>

<template>
  <div>
    <header>
      <nav>
        <RouterLink to="/">Go to Home</RouterLink>
        <RouterLink to="/about">Go to About</RouterLink>
        <RouterLink to="/note">Go to Note</RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
    <footer>
      <p>Powered by Vue 3</p>
    </footer>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
