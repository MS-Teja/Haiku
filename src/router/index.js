import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Submit from '../views/Submit.vue';
import Login from '../views/Login.vue';
import HallOfFame from '../views/HallOfFame.vue';
import HaikuView from '../views/HaikuView.vue';
import About from '../views/About.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/submit', component: Submit },
  { path: '/login', component: Login },
  { path: '/hall-of-fame', component: HallOfFame },
  { path: '/haiku/:id', component: HaikuView },
  { path: '/about', component: About },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;