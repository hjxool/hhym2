import App from './App'
import store from '/Store/main.js' // 引入Vuex仓库
import { createApp } from "vue"; // 引入 createApp 方法
import './uni.promisify.adaptor'

const app = createApp(App)
app.use(store) // 应用Vuex仓库配置
app.mount('#app')
