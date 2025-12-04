📝 todo-frontend

- Frontend dự án Todo App — xây dựng bằng Vue 3, Vite, Pinia, Element Plus, Axios, TailwindCSS.

- Mục tiêu của dự án là thực hành xây dựng ứng dụng quản lý công việc (CRUD Task) với UI hiện đại và code dễ mở rộng.

# 🚀 Công nghệ sử dụng

Dependencies (runtime)
Thư viện Công dụng
vue Framework chính (Vue 3 Composition API).
pinia State management thay thế Vuex, nhẹ và mạnh.
axios Gọi API (GET/POST/PUT/DELETE).
element-plus UI framework với nhiều component đẹp theo chuẩn Vue 3.
@element-plus/icons-vue Icon pack cho Element Plus.
Dev Dependencies (phát triển)
Thư viện Công dụng
vite Bundler siêu nhanh giúp chạy dev và build production.
@vitejs/plugin-vue Plugin hỗ trợ Vue cho Vite.
tailwindcss Utility CSS framework giúp tạo giao diện nhanh.
autoprefixer Tự thêm prefix CSS cho trình duyệt.
postcss Dùng để xử lý CSS pipeline (kết hợp Tailwind).
📦 Yêu cầu hệ thống

Node.js >= 18

npm hoặc yarn hoặc pnpm

# ⚙️ Cài đặt dự án

1. Clone source
   git clone <repository-url>
   cd todo-frontend

2. Cài dependencies
   npm install

Hoặc
yarn install
pnpm install

# ▶️ Chạy dự án (development mode)

npm run dev

Mặc định Vite chạy tại:
👉 http://localhost:5173/

(nếu bạn không đổi port trong vite.config.js)

Vite có Hot Module Replacement (HMR) nên khi thay đổi code sẽ tự cập nhật ngay lập tức.

🏗️ Build production
npm run build

Vite sẽ tạo thư mục:

dist/
assets/
index.html

Bạn có thể deploy thư mục dist lên:

Nginx

Apache

Netlify

Vercel

Cloudflare Pages

Docker static container

# 🔍 Preview bản build

Dùng để test build trước khi deploy:

npm run preview

# 🎨 Cấu hình TailwindCSS

Project của bạn đã có tailwindcss, postcss, autoprefixer.

npx tailwindcss init -p
Bạn cần các file:

1. tailwind.config.js
   export default {
   content: [
   "./index.html",
   "./src/**/*.{vue,js,ts,jsx,tsx}"
   ],
   theme: {
   extend: {},
   },
   plugins: [],
   }

2. postcss.config.js
   export default {
   plugins: {
   tailwindcss: {},
   autoprefixer: {},
   },
   };

3. Import Tailwind vào main CSS

Trong src/assets/main.css:

@tailwind base;
@tailwind components;
@tailwind utilities;

4. Import CSS trong main.js
   import './assets/main.css'

# 🧩 Tích hợp Element Plus

Cài đặt theo tiêu chuẩn:

Trong main.js:

import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import \* as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
app.component(key, component)
}

app.mount('#app')

# 🗂️ Gợi ý cấu trúc thư mục chuẩn

src/
├─ api/ # axios service files
├─ components/ # component dùng lại
├─ stores/ # Pinia stores
├─ views/ # mỗi page là 1 view
├─ router/ # config routes
├─ utils/ # helper functions
├─ assets/ # styles, images
├─ App.vue
└─ main.js

# 📡 Gọi API bằng Axios (ví dụ)

Tạo instance axios:

src/api/axios.js

import axios from "axios";

const api = axios.create({
baseURL: "http://localhost:5000/api"
});

export default api;

Ví dụ CRUD task
export const getTasks = () => api.get("/tasks");
export const createTask = (data) => api.post("/tasks", data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

# 🔥 Chạy dự án nhanh nhất có thể

Clone

npm install

npm run dev

Mở: http://localhost:5173
