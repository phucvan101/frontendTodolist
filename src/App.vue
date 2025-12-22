<template>
  <el-main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
    <!-- Header -->
    <header class="bg-white shadow-md sticky top-0 z-10 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <el-icon class="text-white" size="24">
                <CircleCheck />
              </el-icon>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Todo Manager</h1>
          </div>

          <!-- User Menu & Dark Toggle -->
          <div class="flex items-center gap-4">
            <!-- Dark Mode Toggle -->
            <el-tooltip content="Chuyển giao diện" placement="bottom">
              <el-button link @click="toggleDark">
                <el-icon :style="{ color: isDark ? '#ff6000' : '#409efc' }">
                  <Sun v-if="isDark" />
                  <Moon v-else />
                </el-icon>
              </el-button>
            </el-tooltip>

            <div v-if="authStore.isLoggedIn" class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <el-avatar :size="36" :icon="UserFilled" />
                <span class="font-medium text-gray-700 dark:text-gray-200">{{ authStore.user?.name }}</span>
              </div>
              <el-button type="danger" :icon="SwitchButton" @click="handleLogout">
                Đăng xuất
              </el-button>
            </div>
            <el-button v-else type="primary" @click="login">
              Đăng nhập
            </el-button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Search & Filter Bar -->
      <el-card shadow="never" class="mb-6 dark:bg-gray-800 dark:text-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <el-input v-model="taskStore.searchTerm" placeholder="Tìm kiếm task..." :prefix-icon="Search" clearable
              @input="handleSearch" />
          </div>

          <!-- Filter Status -->
          <el-select v-model="taskStore.filterStatus" placeholder="Lọc trạng thái" @change="taskStore.fetchTasks()">
            <el-option label="Tất cả" value="all" />
            <el-option label="Đang làm" value="pending" />
            <el-option label="Hoàn thành" value="done" />
          </el-select>

          <!-- Sort -->
          <el-select v-model="taskStore.sortBy" placeholder="Sắp xếp" @change="taskStore.fetchTasks()">
            <el-option label="Ngày tạo" value="createdAt" />
            <el-option label="Hạn chót" value="dueDate" />
          </el-select>
        </div>
      </el-card>

      <!-- Stats Cards -->
      <div v-if="authStore.isLoggedIn" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <el-card shadow="hover" class="dark:bg-gray-800 dark:text-gray-200">
          <el-statistic title="Tổng số task" :value="taskStore.tasks.length">
            <template #prefix>
              <el-icon color="#409eff">
                <List />
              </el-icon>
            </template>
          </el-statistic>
        </el-card>

        <el-card shadow="hover" class="dark:bg-gray-800 dark:text-gray-200">
          <el-statistic title="Đang làm" :value="taskStore.pendingTasks.length">
            <template #prefix>
              <el-icon color="#e6a23c">
                <Clock />
              </el-icon>
            </template>
          </el-statistic>
        </el-card>

        <el-card shadow="hover" class="dark:bg-gray-800 dark:text-gray-200">
          <el-statistic title="Hoàn thành" :value="taskStore.completedTasks.length">
            <template #prefix>
              <el-icon color="#67c23a">
                <CircleCheck />
              </el-icon>
            </template>
          </el-statistic>
        </el-card>
      </div>

      <!-- Add Task Button -->
      <el-button v-if="authStore.isLoggedIn" type="primary" size="large" :icon="Plus" @click="showTaskDrawer = true"
        class="mb-6">
        Thêm Task Mới
      </el-button>

      <!-- Task List -->
      <el-skeleton v-if="taskStore.loading" :rows="5" animated />
      <TaskList v-else :tasks="taskStore.tasks" @add-task="openCreateTask" @edit-task="handleEditTask"
        @share-task="handleShareTask" />
    </main>
    <!-- Login Dialog -->
    <LoginForm v-model:visible="showLoginDialog" @success="handleLoginSuccess" />
    <!-- Task Drawer -->
    <TaskForm v-model:visible="showTaskDrawer" :task="editingTask" @success="handleTaskSuccess" />

    <!-- Share Task Dialog -->
    <ShareTaskDialog v-model:visible="showShareDialog" :task="sharingTask" @success="handleShareSuccess" />
  </el-main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';

import LoginForm from './components/LoginForm.vue';
import TaskForm from './components/TaskForm.vue';
import TaskList from './components/TaskList.vue';
import ShareTaskDialog from './components/ShareTaskDialog.vue';
const authStore = useAuthStore();
const taskStore = useTaskStore();
const showLoginDialog = ref(false);
const showTaskDrawer = ref(false);
const showShareDialog = ref(false);

const sharingTask = ref(null);

const handleLoginSuccess = () => {
  showLoginDialog.value = false;
  taskStore.fetchTasks();
};
const handleLogout = () => {
  authStore.logout();
  taskStore.clearTasks();
};
const handleTaskSuccess = () => {
  showTaskDrawer.value = false;
  // refresh list and clear editing state after success (create or update)
  taskStore.fetchTasks();
  editingTask.value = null;
};
const handleSearch = () => {
  taskStore.fetchTasks();
};

const login = () => {
  showLoginDialog.value = true;
}

// --- Added for edit functionality ---
const editingTask = ref(null);

const openCreateTask = () => {
  editingTask.value = null;
  showTaskDrawer.value = true;
};

const handleEditTask = (task) => {
  editingTask.value = task;
  showTaskDrawer.value = true;
};

const handleShareTask = (task) => {
  sharingTask.value = task;
  console.log('share task: ', sharingTask.value);
  showShareDialog.value = true;
};

const handleShareSuccess = () => {
  taskStore.fetchTasks();
  showShareDialog.value = false;
};

// --- Dark mode logic ---
const DARK_KEY = 'darkMode';
const isDark = ref(false);

const applyDarkClass = (enabled) => {
  const el = document.documentElement;
  if (enabled) el.classList.add('dark');
  else el.classList.remove('dark');
};

const toggleDark = () => {
  isDark.value = !isDark.value;
  applyDarkClass(isDark.value);
  localStorage.setItem(DARK_KEY, isDark.value ? '1' : '0');
};


// initialize from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem(DARK_KEY);

  if (saved === '1') {
    isDark.value = true;
  } else if (saved === '0') {
    isDark.value = false;
  } else {
    // auto-detect system
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  applyDarkClass(isDark.value);
});

// keep class in sync if changed
watch(isDark, (val) => {
  applyDarkClass(val);
});
</script>