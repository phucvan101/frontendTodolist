import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './style.css';
import App from './App.vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/authStore'; // thêm
import { useTaskStore } from '@/stores/taskStore'; // thêm

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(ElementPlus);

// Register all icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// Khôi phục auth từ localStorage và tải tasks nếu đã đăng nhập
const authStore = useAuthStore();
authStore.initAuth();

const taskStore = useTaskStore();
if (authStore.isLoggedIn) {
    taskStore.fetchTasks().catch((error) => {
        console.error('Failed to fetch tasks on app init:', error);
    });
}

app.mount('#app');