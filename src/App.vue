<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <el-icon :size="24" color="#fff">
                <CircleCheck />
              </el-icon>
            </div>
            <h1 class="text-2xl font-bold text-gray-800">Todo Manager Pro</h1>
          </div>

          <!-- User Menu -->
          <div v-if="authStore.isLoggedIn" class="flex items-center gap-3">
            <el-tooltip content="Lịch sử hoạt động">
              <el-button :icon="Clock" circle @click="showActivityLog = true" />
            </el-tooltip>

            <el-tooltip content="Quản lý danh mục">
              <el-button :icon="FolderOpened" circle @click="showCategoryManager = true" />
            </el-tooltip>

            <el-dropdown>
              <div class="flex items-center gap-2 cursor-pointer">
                <el-avatar :size="36" :icon="UserFilled" />
                <span class="font-medium text-gray-700">{{ authStore.user?.name }}</span>
                <el-icon>
                  <ArrowDown />
                </el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :icon="User">
                    {{ authStore.user?.email }}
                  </el-dropdown-item>
                  <el-dropdown-item divided :icon="SwitchButton" @click="handleLogout">
                    Đăng xuất
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <el-button v-else type="primary" @click="showLoginDialog = true">
            Đăng nhập
          </el-button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <div v-if="authStore.isLoggedIn">
        <!-- Search & Filter Bar -->
        <el-card shadow="never" class="mb-6">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <!-- Search -->
              <div class="md:col-span-2">
                <el-input v-model="taskStore.searchTerm" placeholder="Tìm kiếm task..." :prefix-icon="Search" clearable
                  @input="handleSearch" />
              </div>

              <!-- Filter Status -->
              <el-select v-model="taskStore.filterStatus" placeholder="Trạng thái" @change="taskStore.fetchTasks()"
                clearable>
                <el-option label="Tất cả" value="all" />
                <el-option label="Chưa bắt đầu" value="pending" />
                <el-option label="Đang làm" value="in-progress" />
                <el-option label="Hoàn thành" value="done" />
              </el-select>

              <!-- Filter Priority -->
              <el-select v-model="taskStore.filterPriority" placeholder="Độ ưu tiên" @change="handleSearch" clearable>
                <el-option label="Tất cả" value="all" />
                <el-option label="Thấp" value="low" />
                <el-option label="Trung bình" value="medium" />
                <el-option label="Cao" value="high" />
                <el-option label="Khẩn cấp" value="urgent" />
              </el-select>

              <!-- Sort -->
              <el-select v-model="taskStore.sortBy" placeholder="Sắp xếp" @change="taskStore.fetchTasks()" clearable>
                <el-option label="Ngày tạo" value="createdAt" />
                <el-option label="Hạn chót" value="dueDate" />
                <el-option label="Độ ưu tiên" value="priority" />
              </el-select>
            </div>

            <!-- Category Filter -->
            <div class="flex items-center gap-2 overflow-x-auto pb-2">
              <el-button :type="taskStore.filterCategory === '' ? 'primary' : ''" size="small"
                @click="handleCategoryFilter('')">
                Tất cả
              </el-button>
              <el-button v-for="cat in categoryStore.categories" :key="cat._id"
                :type="taskStore.filterCategory === cat._id ? 'primary' : ''" size="small"
                @click="handleCategoryFilter(cat._id)">
                {{ cat.icon }} {{ cat.name }}
              </el-button>
            </div>

            <!-- Deleted Filter -->
            <!-- <div class="flex items-center gap-2">
            <el-switch v-model="taskStore.includeDeleted" @change="taskStore.fetchTasks()" />
            <span class="text-sm text-gray-600">Hiển thị task đã xóa</span>
          </div> -->
          </div>
        </el-card>

        <!-- AI Assistant Dropdown -->
        <div class="flex justify-end mb-4">
          <el-dropdown>
            <el-button type="primary" :icon="MagicStick">
              AI Assistant
              <el-icon class="ml-1">
                <ArrowDown />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="Plus" @click="showAIGenerator = true">
                  🤖 Smart Task Generator
                </el-dropdown-item>
                <el-dropdown-item :icon="DocumentCopy" @click="showAIBreakdown = true">
                  🧩 Task Breakdown
                </el-dropdown-item>
                <el-dropdown-item divided>
                  <div class="text-xs text-gray-500">
                    Powered by Gemini
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- Stats Cards -->
        <div v-if="authStore.isLoggedIn" class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <el-card shadow="hover" class="hover:scale-105 transition-transform">
            <el-statistic title="Tổng số" :value="taskStore.tasks.filter(t => !t.isDeleted).length">
              <template #prefix>
                <el-icon color="#409eff">
                  <List />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>

          <el-card shadow="hover" class="hover:scale-105 transition-transform">
            <el-statistic title="Chưa bắt đầu" :value="taskStore.pendingTasks?.length">
              <template #prefix>
                <el-icon color="#909399">
                  <Clock />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>

          <el-card shadow="hover" class="hover:scale-105 transition-transform">
            <el-statistic title="Đang làm" :value="taskStore.inProgressTasks?.length">
              <template #prefix>
                <el-icon color="#e6a23c">
                  <Loading />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>

          <el-card shadow="hover" class="hover:scale-105 transition-transform">
            <el-statistic title="Hoàn thành" :value="taskStore.completedTasks?.length">
              <template #prefix>
                <el-icon color="#67c23a">
                  <CircleCheck />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>

          <el-card shadow="hover" class="hover:scale-105 transition-transform">
            <el-statistic title="Khẩn cấp" :value="taskStore.urgentTasks?.length">
              <template #prefix>
                <el-icon color="#f56c6c">
                  <WarningFilled />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </div>

        <!-- Action Buttons -->
        <div v-if="authStore.isLoggedIn" class="flex gap-3 mb-6">
          <el-button type="primary" size="large" :icon="Plus" @click="showTaskDrawer = true">
            Thêm Task Mới
          </el-button>

          <el-button v-if="taskStore.deletedTasks?.length > 0" type="warning" size="large" :icon="Delete">
            Thùng rác ({{ taskStore.deletedTasks.length }})
          </el-button>
        </div>

        <!-- Task List -->
        <el-skeleton v-if="taskStore.loading" :rows="5" animated />
        <TaskList v-else :tasks="taskStore.tasks" @edit-task="handleEditTask" @add-task="showTaskDrawer = true"
          @share-task="handleShareTask" @comment-task="handleCommentTask" />

      </div>
      <!-- Empty State for Not Logged In -->
      <el-card v-if="!authStore.isLoggedIn" shadow="never" class="text-center py-12">
        <el-icon :size="80" color="#409eff">
          <Lock />
        </el-icon>
        <h2 class="text-2xl font-bold mt-4 mb-2">Chào mừng đến với Todo Manager Pro</h2>
        <p class="text-gray-600 mb-6">Vui lòng đăng nhập để quản lý tasks của bạn</p>
        <el-button type="primary" size="large" @click="showLoginDialog = true">
          Đăng nhập ngay
        </el-button>
      </el-card>
    </main>

    <!-- Login Dialog -->
    <LoginForm v-model:visible="showLoginDialog" @success="handleLoginSuccess" />

    <div v-if="authStore.isLoggedIn">
      <!-- Task Form Drawer -->
      <TaskForm v-model:visible="showTaskDrawer" :task="editingTask" @success="handleTaskFormSuccess" />

      <!-- Category Manager -->
      <CategoryManager v-model:visible="showCategoryManager" />

      <!-- Share Task Dialog -->
      <ShareTaskDialog v-model:visible="showShareDialog" :task="sharingTask" @success="handleShareSuccess" />

      <!-- Comment Drawer -->
      <CommentDrawer v-model:visible="showCommentDrawer" :task="commentingTask" />

      <!-- AI Components -->
      <AITaskGenerator v-model:visible="showAIGenerator" @success="handleAISuccess" />

      <AITaskBreakdown v-model:visible="showAIBreakdown" @success="handleAISuccess" />
    </div>

    <!-- Activity Log -->
    <!-- <ActivityLog v-model:visible="showActivityLog" /> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  CircleCheck,
  UserFilled,
  SwitchButton,
  Search,
  Plus,
  List,
  Clock,
  Delete,
  FolderOpened,
  User,
  ArrowDown,
  Lock,
  Loading,
  WarningFilled,
  DocumentCopy,
  MagicStick
} from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { useCategoryStore } from '@/stores/categoryStore';
import LoginForm from '@/components/LoginForm.vue';
import TaskForm from '@/components/TaskForm.vue';
import TaskList from '@/components/TaskList.vue';
import CategoryManager from '@/components/CategoryManager.vue';
import ShareTaskDialog from '@/components/ShareTaskDialog.vue';
import CommentDrawer from '@/components/CommentDrawer.vue';
import AITaskGenerator from '@/components/AITaskGenerator.vue';
import AITaskBreakdown from '@/components/AITaskBreakdown.vue';
// import ActivityLog from '@/components/ActivityLog.vue';

const authStore = useAuthStore();
const taskStore = useTaskStore();
const categoryStore = useCategoryStore();

const showLoginDialog = ref(false);
const showTaskDrawer = ref(false);
const showCategoryManager = ref(false);
const showShareDialog = ref(false);
const showCommentDrawer = ref(false);
const showActivityLog = ref(false);

const showAIGenerator = ref(false);
const showAIBreakdown = ref(false);

const editingTask = ref(null);
const sharingTask = ref(null);
const commentingTask = ref(null);

let searchTimeout = null;

onMounted(() => {
  authStore.initAuth();
  if (authStore.isLoggedIn) {
    taskStore.fetchTasks();
    categoryStore.fetchCategories();
  }
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    taskStore.fetchTasks();
  }, 500);
};

const handleCategoryFilter = (categoryId) => {
  taskStore.filterCategory = categoryId;
  taskStore.fetchTasks();
};

const handleLogout = async () => {
  await authStore.logout();
  taskStore.tasks = [];
  categoryStore.categories = [];
};

const handleLoginSuccess = () => {
  taskStore.fetchTasks();
  categoryStore.fetchCategories();
};

const handleEditTask = (task) => {
  editingTask.value = task;
  showTaskDrawer.value = true;
};

const handleTaskFormSuccess = () => {
  editingTask.value = null;
  taskStore.fetchTasks();
};

const handleShareTask = (task) => {
  sharingTask.value = task;
  showShareDialog.value = true;
};

const handleShareSuccess = () => {
  taskStore.fetchTasks();
};

const handleCommentTask = (task) => {
  commentingTask.value = task;
  showCommentDrawer.value = true;
};
</script>

<style>
@import 'element-plus/dist/index.css';

.el-statistic__content {
  font-size: 24px;
  font-weight: bold;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>