<template>
  <div class="layout">
    <header class="header">
      <nav class="nav-bar">
        <div class="logo">
          <RouterLink to="/">MyLogo</RouterLink>
        </div>
        <div class="nav-actions">
          <div class="nav-links">
            <RouterLink to="/">Home</RouterLink>
            <RouterLink to="/about">About</RouterLink>
            <RouterLink to="/note">Note</RouterLink>
          </div>
          <div class="sign-in">
            <button class="sign-in-btn">Sign In</button>
          </div>
        </div>
      </nav>
    </header>
    <main class="main-content">
      <div class="container">
        <slot />
      </div>
    </main>
    <footer class="footer">
      <p>Powered by Vue 3</p>
    </footer>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.header {
  background: #f8f8f8;
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
}
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}
.logo {
  font-weight: bold;
  font-size: 1.5rem;
}
.nav-actions {
  display: flex;
  align-items: center;
}
.nav-links {
  display: flex;
  gap: 1.5rem;
}
.sign-in {
  margin-left: 1rem;
}
.sign-in-btn {
  padding: 6px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  background: #42b883;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.sign-in-btn:hover {
  background: #369870;
}
.main-content {
  flex: 1 0 auto;
  background: #fff;
  padding: 2rem 0;
}
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}
.footer {
  background: #f8f8f8;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}
</style>