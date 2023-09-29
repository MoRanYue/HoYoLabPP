import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', name: 'Root', redirect: '/home'},
    {path: '/:pathMatch(.*)', name: 'Undefined', redirect: '/404'},
    {path: '/404', name: 'NotFound', component: () => import("@/views/NotFound.vue")},
    {path: '/home', name: 'Home', component: () => import("@/views/Home.vue")},
    {path: '/article/:postId(\\d+)?', name: 'Article', component: () => import("@/views/Article.vue")},
    {path: '/user/:userId(\\d+)?', name: 'User', component: () => import("@/views/User.vue")},
    {path: '/gameRecord/:gameId?/:gameUserId(\\d+)?', name: 'GameRecord', component: () => import("@/views/GameRecord.vue")},
  ]
})

export default router
