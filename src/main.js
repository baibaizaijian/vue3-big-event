import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from '@/stores/index'
import '@/assets/main.scss'

const app = createApp(App)
//安装持久化插件
app.use(pinia)
app.use(router)

app.mount('#app')
