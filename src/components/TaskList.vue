<template>
    <div class="space-y-4">
        <!-- Empty State -->
        <el-empty v-if="!taskStore.loading && tasks.length === 0" description="Chưa có task nào" :image-size="200">
            <el-button type="primary" @click="$emit('add-task')">
                Thêm Task Đầu Tiên
            </el-button>
        </el-empty>

        <!-- Task Cards -->
        <el-card v-for="task in tasks" :key="task._id" shadow="hover" class="transition-all hover:shadow-lg"
            :body-style="{ padding: '20px' }">
            <div class="flex items-start gap-4">
                <!-- Checkbox -->
                <el-checkbox :model-value="task.status === 'done'" @change="handleToggleStatus(task)" size="large"
                    class="mt-1" />

                <!-- Task Content -->
                <div class="flex-1">
                    <h3 :class="[
                        'text-lg font-semibold mb-2',
                        task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'
                    ]">
                        {{ task.title }}
                    </h3>

                    <p v-if="task.description" class="text-gray-600 mb-3">
                        {{ task.description }}
                    </p>

                    <div class="flex items-center gap-3 flex-wrap">
                        <!-- Status Tag -->
                        <el-tag :type="task.status === 'done' ? 'success' : 'warning'" effect="light" size="default">
                            <el-icon class="mr-1">
                                <CircleCheck v-if="task.status === 'done'" />
                                <Clock v-else />
                            </el-icon>
                            {{ task.status === 'done' ? 'Hoàn thành' : 'Đang làm' }}
                        </el-tag>

                        <!-- Due Date -->
                        <el-tag v-if="task.dueDate" type="info" effect="plain" size="default">
                            <el-icon class="mr-1">
                                <Calendar />
                            </el-icon>
                            Hạn: {{ formatDate(task.dueDate) }}
                        </el-tag>

                        <!-- Created At -->
                        <span class="text-sm text-gray-500">
                            Tạo: {{ formatDate(task.createdAt) }}
                        </span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2">
                    <el-button type="primary" :icon="Edit" circle @click="handleEdit(task)" />
                    <el-button type="danger" :icon="Delete" circle @click="handleDelete(task)" />
                </div>
            </div>
        </el-card>

        <!-- Pagination -->
        <div v-if="taskStore.pagination && taskStore.pagination.pages > 1" class="flex justify-center mt-6">
            <el-pagination v-model:current-page="currentPage" :page-size="10" :total="taskStore.pagination.total"
                layout="prev, pager, next, total" @current-change="handlePageChange" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { Edit, Delete, Calendar, Clock, CircleCheck } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { useTaskStore } from '@/stores/taskStore';

const taskStore = useTaskStore();
console.log('taskStore in TaskList.vue: ', taskStore.p);

defineProps({
    tasks: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['edit-task', 'add-task']);

// Initialize currentPage from store pagination (use .value because pagination is a ref in the store)
const currentPage = ref(taskStore.pagination?.page ?? 1);
// Keep local currentPage in sync with store pagination.page
watch(
    () => taskStore.pagination?.page,
    (newPage) => {
        if (typeof newPage === 'number') {
            currentPage.value = newPage;
        }
    }
);


// Ensure tasks are loaded on mount and currentPage is correct
onMounted(() => {
    if (taskStore.tasks.length === 0) {
        taskStore.fetchTasks(currentPage.value);
    } else {
        currentPage.value = taskStore.pagination?.page ?? 1;
    }
});

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const handleToggleStatus = async (task) => {
    await taskStore.toggleTaskStatus(task);
};

const handleEdit = (task) => {
    emit('edit-task', task);
};

const handleDelete = async (task) => {
    try {
        await ElMessageBox.confirm(
            'Bạn có chắc chắn muốn xóa task này?',
            'Xác nhận xóa',
            {
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy',
                type: 'warning'
            }
        );

        await taskStore.deleteTask(task._id);
    } catch (error) {
        // User cancelled
    }
};

const handlePageChange = (page) => {
    // update local page immediately for responsive UI and fetch that page from the store
    currentPage.value = page;
    taskStore.fetchTasks(page);
};
</script>