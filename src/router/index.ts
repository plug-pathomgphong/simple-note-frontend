import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../components/HomeView.vue'
import AboutView from '../components/AboutView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
  // Add more routes as needed
  { path: '/note', component: () => import('../components/NoteView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router