import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

async function loadConfig() {
  const response = await fetch('/config.json');
  if (!response.ok) {
    throw new Error('Failed to load configuration');
  }
  const config = await response.json();
  window.__APP_CONFIG__ = config;
  console.log('Configuration loaded:', config);
}

loadConfig().catch(error => {
  console.error('Error loading configuration:', error);
});

import router from './router/index'

createApp(App).use(router).mount('#app')
