import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'
import { MotionPlugin } from '@vueuse/motion'
import 'https://static.geetest.com/static/js/gt.0.4.9.js'

import App from './App.vue'
import router from './router'
import { notify } from './utils/notification'

import '@/api/resources'
import 'normalize.css'
import './assets/main.less'

const pinia = createPinia()
pinia.use(piniaPersist)

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(MotionPlugin)

app.mount('#app')
